import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { sampleBots, generateBotXpValues } from './botPool';

admin.initializeApp();
const db = admin.firestore();

const LEAGUES = ['bronze', 'silver', 'gold', 'diamond', 'master'];

const getCompletedWeekString = (date: Date): string => {
    const target = new Date(date.valueOf());
    const dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
    const weekString = weekNumber.toString().padStart(2, '0');
    return `${target.getFullYear()}_W${weekString}`;
};

export const resolveWeeklyLeagues = functions.pubsub
    .schedule('59 23 * * 0') // 11:59 PM every Sunday
    .timeZone('America/New_York')
    .onRun(async (context) => {
        // Evaluate based on the precise time the function runs
        const now = new Date();
        const weekString = getCompletedWeekString(now);

        console.log(`Starting Weekly Execution for: ${weekString}`);

        try {
            // Read all buckets that begin with this week's signature
            // Using a simple query because currentBucketId maps directly, but documents 
            // in leaderboards are keyed strictly as `2026_Wxx_league_index`
            const bucketsSnapshot = await db.collection('leaderboards')
                .where(admin.firestore.FieldPath.documentId(), '>=', weekString)
                .where(admin.firestore.FieldPath.documentId(), '<', weekString + '\uf8ff')
                .get();

            console.log(`Found ${bucketsSnapshot.size} buckets to evaluate.`);

            let batch = db.batch();
            let operationsCount = 0;
            let totalProcessed = 0;

            for (const doc of bucketsSnapshot.docs) {
                // Ignore metadata documents, only evaluate actual buckets
                if (doc.id.startsWith('metadata_')) continue;

                const data = doc.data();
                const participantsObj = data.participants || {};

                // Map and Sort
                const ladder = Object.keys(participantsObj).map(uid => ({
                    uid,
                    xp: participantsObj[uid].weeklyXp || 0,
                    ...participantsObj[uid]
                })).sort((a, b) => b.xp - a.xp);

                // Re-assign ranks
                ladder.forEach((user, index) => {
                    user.rank = index + 1;
                });

                // Apply Matchmaking Logic
                for (const user of ladder) {
                    // Skip bots — no users doc to update
                    if (user.uid.startsWith('bot_')) continue;

                    const userRef = db.collection('users').doc(user.uid);
                    // Extract current league from bucket string: 2026_W11_bronze_1 => bronze
                    // Standard split array: [year, week, league, index]
                    const idParts = doc.id.split('_');
                    const currentLeague = idParts[2] || 'bronze';
                    const currentLeagueIdx = LEAGUES.indexOf(currentLeague);

                    let newLeague = currentLeague;

                    // 1. Zero XP Automatic Demotion Rule
                    if (user.xp === 0) {
                        newLeague = currentLeagueIdx > 0 ? LEAGUES[currentLeagueIdx - 1] : LEAGUES[0];
                    } 
                    // 2. Promotion (Top 5)
                    else if (user.rank <= 5) {
                        newLeague = currentLeagueIdx < LEAGUES.length - 1 ? LEAGUES[currentLeagueIdx + 1] : LEAGUES[currentLeagueIdx];
                    }
                    // 3. Demotion (Bottom 8, 23-30)
                    else if (user.rank >= 23) {
                        newLeague = currentLeagueIdx > 0 ? LEAGUES[currentLeagueIdx - 1] : LEAGUES[0];
                    }
                    // Safe zone avoids mutation of newLeague

                    // Attach to batch
                    batch.update(userRef, {
                        league: newLeague,
                        previousWeekRank: user.rank,
                        // currentBucketId will be intercepted/reset on next login
                    });

                    operationsCount++;
                    totalProcessed++;

                    // Write Batch limits are 500, commit at 450 to leave safety margin
                    if (operationsCount >= 450) {
                        await batch.commit();
                        batch = db.batch();
                        operationsCount = 0;
                        console.log(`Committed chunk. Processed ${totalProcessed} users...`);
                    }
                }
            }

            // Flush remaining chunk
            if (operationsCount > 0) {
                await batch.commit();
                console.log(`Committed final chunk. Total Processed: ${totalProcessed}`);
            }

            console.log(`✅ Weekly Leagues successfully resolved for ${weekString}`);
            return null;

        } catch (error) {
            console.error('CRITICAL: Failed to resolve weekly leagues.', error);
            return null;
        }
    });

/**
 * Callable Cloud Function: Seeds 29 bots into a freshly created bucket.
 * Called from the client after a real user is the first to join a bucket.
 */
export const seedBotsIntoBucket = functions.https.onCall(async (data, context) => {
    const bucketId = data.bucketId;

    if (!bucketId || typeof bucketId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'bucketId is required.');
    }

    try {
        const bucketRef = db.collection('leaderboards').doc(bucketId);
        const bucketSnap = await bucketRef.get();

        // Idempotent guard: only seed if bucket has <= 1 participant (the real user)
        if (bucketSnap.exists) {
            const participants = bucketSnap.data()?.participants || {};
            if (Object.keys(participants).length > 1) {
                console.log(`Bucket ${bucketId} already has ${Object.keys(participants).length} participants. Skipping seed.`);
                return { success: true, message: 'Already seeded.' };
            }
        }

        // Sample 29 bots and generate XP values
        const bots = sampleBots(29);
        const xpValues = generateBotXpValues();

        // Build the participants map payload
        const botParticipants: Record<string, any> = {};
        bots.forEach((bot, index) => {
            botParticipants[bot.id] = {
                weeklyXp: xpValues[index],
                displayName: bot.displayName,
                photoURL: bot.photoURL
            };
        });

        // Merge bots into the bucket
        await bucketRef.set({ participants: botParticipants }, { merge: true });

        // Update metadata playerCount to 30
        // Extract league and week from bucketId: e.g., 2026_W12_bronze_1
        const parts = bucketId.split('_');
        if (parts.length >= 4) {
            const weekString = `${parts[0]}_${parts[1]}`;
            const league = parts[2];
            const metadataRef = db.collection('leaderboards').doc(`metadata_${weekString}_${league}`);
            await metadataRef.set({ playerCount: 30 }, { merge: true });
        }

        console.log(`🤖 Seeded 29 bots into bucket: ${bucketId}`);
        return { success: true, message: `Seeded 29 bots into ${bucketId}` };

    } catch (error) {
        console.error('Failed to seed bots:', error);
        throw new functions.https.HttpsError('internal', 'Failed to seed bots.');
    }
});

