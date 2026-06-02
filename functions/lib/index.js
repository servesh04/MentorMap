"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateDashboardMetrics = exports.seedBotsIntoBucket = exports.resolveWeeklyLeagues = void 0;
exports.runAggregation = runAggregation;
const functions = __importStar(require("firebase-functions/v1"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const botPool_1 = require("./botPool");
admin.initializeApp();
const db = admin.firestore();
const LEAGUES = ['bronze', 'silver', 'gold', 'diamond', 'master'];
const getCompletedWeekString = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
    const weekString = weekNumber.toString().padStart(2, '0');
    return `${target.getFullYear()}_W${weekString}`;
};
exports.resolveWeeklyLeagues = functions.pubsub
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
            if (doc.id.startsWith('metadata_'))
                continue;
            const data = doc.data();
            const participantsObj = data.participants || {};
            // Map and Sort
            const ladder = Object.keys(participantsObj).map(uid => (Object.assign({ uid, xp: participantsObj[uid].weeklyXp || 0 }, participantsObj[uid]))).sort((a, b) => b.xp - a.xp);
            // Re-assign ranks
            ladder.forEach((user, index) => {
                user.rank = index + 1;
            });
            // Apply Matchmaking Logic
            for (const user of ladder) {
                // Skip bots — no users doc to update
                if (user.uid.startsWith('bot_'))
                    continue;
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
    }
    catch (error) {
        console.error('CRITICAL: Failed to resolve weekly leagues.', error);
        return null;
    }
});
/**
 * Callable Cloud Function: Seeds 29 bots into a freshly created bucket.
 * Called from the client after a real user is the first to join a bucket.
 */
exports.seedBotsIntoBucket = functions.https.onCall(async (data, context) => {
    var _a;
    const bucketId = data.bucketId;
    if (!bucketId || typeof bucketId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'bucketId is required.');
    }
    try {
        const bucketRef = db.collection('leaderboards').doc(bucketId);
        const bucketSnap = await bucketRef.get();
        // Idempotent guard: only seed if bucket has <= 1 participant (the real user)
        if (bucketSnap.exists) {
            const participants = ((_a = bucketSnap.data()) === null || _a === void 0 ? void 0 : _a.participants) || {};
            if (Object.keys(participants).length > 1) {
                console.log(`Bucket ${bucketId} already has ${Object.keys(participants).length} participants. Skipping seed.`);
                return { success: true, message: 'Already seeded.' };
            }
        }
        // Sample 29 bots and generate XP values
        const bots = (0, botPool_1.sampleBots)(29);
        const xpValues = (0, botPool_1.generateBotXpValues)();
        // Build the participants map payload
        const botParticipants = {};
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
    }
    catch (error) {
        console.error('Failed to seed bots:', error);
        throw new functions.https.HttpsError('internal', 'Failed to seed bots.');
    }
});
/**
 * Nightly scheduled Firebase v2 Cloud Function:
 * Aggregates platform-wide user progress, chat logs, security telemetry,
 * and game state to write a single report document.
 */
exports.aggregateDashboardMetrics = (0, scheduler_1.onSchedule)({
    schedule: '0 0 * * *', // Run nightly at midnight
    timeZone: 'America/New_York',
    memory: '256MiB',
}, async (event) => {
    console.log('Starting nightly Firestore Aggregation Pipeline...');
    try {
        await runAggregation(db, admin);
        console.log('✅ Nightly Firestore Aggregation Pipeline completed successfully.');
    }
    catch (error) {
        console.error('CRITICAL: Nightly Firestore Aggregation Pipeline failed:', error);
    }
});
/**
 * Execute the complete aggregation pipeline on the provided Firestore instance.
 */
async function runAggregation(db, admin) {
    // 1. Savings Tracker (Metric 1)
    const webGpuCountSnap = await db.collection('chat_logs').where('inferenceType', '==', 'webgpu').count().get();
    const groqCountSnap = await db.collection('chat_logs').where('inferenceType', '==', 'groq').count().get();
    const webGpuCount = webGpuCountSnap.data().count || 0;
    const groqCount = groqCountSnap.data().count || 0;
    const totalChats = webGpuCount + groqCount;
    const webGpuPercent = totalChats > 0 ? (webGpuCount / totalChats) * 100 : 0;
    const groqPercent = totalChats > 0 ? (groqCount / totalChats) * 100 : 0;
    // 2. Cost-Per-Learner (Metric 2)
    const usersCountSnap = await db.collection('users').count().get();
    const totalActiveUsers = usersCountSnap.data().count || 0;
    const baseInfrastructureCost = 50.00; // Mock base cost in USD
    const groqApiCost = groqCount * 0.0015; // Estimated Groq cost ($0.0015/query)
    const totalOperations = totalChats;
    const estimatedCostPerLearner = totalActiveUsers > 0
        ? (baseInfrastructureCost + groqApiCost) / totalActiveUsers
        : 0;
    // 3. Security Intercepts (Metric 3)
    const telemetryAggSnap = await db.collection('telemetry_logs').aggregate({
        emails: admin.firestore.AggregateField.sum('pii_blocked.emails'),
        tokens: admin.firestore.AggregateField.sum('pii_blocked.tokens'),
        networking: admin.firestore.AggregateField.sum('pii_blocked.networking'),
        credentials: admin.firestore.AggregateField.sum('pii_blocked.credentials'),
    }).get();
    const emails = telemetryAggSnap.data().emails || 0;
    const tokens = telemetryAggSnap.data().tokens || 0;
    const networking = telemetryAggSnap.data().networking || 0;
    const credentials = telemetryAggSnap.data().credentials || 0;
    const totalBlocked = emails + tokens + networking + credentials;
    // 4. Curriculum Heatmap (Metric 4)
    const roadmapsSnap = await db.collection('roadmaps').get();
    const curriculumHeatmap = {};
    roadmapsSnap.forEach((doc) => {
        const data = doc.data();
        const topic = data.topic || data.title || 'General';
        curriculumHeatmap[topic] = (curriculumHeatmap[topic] || 0) + 1;
    });
    // 5. Skill Velocity (Metric 5)
    const progressSnap = await db.collection('module_progress')
        .where('moduleCompletedAt', '!=', null)
        .get();
    let totalDeltaSeconds = 0;
    let completedCount = 0;
    progressSnap.forEach((doc) => {
        const data = doc.data();
        if (data.moduleStartedAt && data.moduleCompletedAt) {
            const start = data.moduleStartedAt.toDate().getTime();
            const end = data.moduleCompletedAt.toDate().getTime();
            const delta = (end - start) / 1000;
            if (delta > 0) {
                totalDeltaSeconds += delta;
                completedCount++;
            }
        }
    });
    const averageDeltaSeconds = completedCount > 0 ? totalDeltaSeconds / completedCount : 0;
    // 6. Friction Node (Metric 6)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const abandonmentSnap = await db.collection('module_progress')
        .where('status', '==', 'in_progress')
        .where('lastActiveAt', '<', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .get();
    const abandonmentFrequency = {};
    abandonmentSnap.forEach((doc) => {
        const data = doc.data();
        const node = data.chapterId || data.topic || 'Unknown Module';
        abandonmentFrequency[node] = (abandonmentFrequency[node] || 0) + 1;
    });
    let mostAbandonedNode = 'None';
    let abandonedCount = 0;
    for (const [node, count] of Object.entries(abandonmentFrequency)) {
        if (count > abandonedCount) {
            mostAbandonedNode = node;
            abandonedCount = count;
        }
    }
    // 7. Mentor AI Reliance (Metric 7)
    const usersSnap = await db.collection('users').get();
    const cohorts = new Set();
    usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.cohort) {
            cohorts.add(data.cohort);
        }
    });
    if (cohorts.size === 0) {
        cohorts.add('Default Cohort');
    }
    const mentorAiReliance = {};
    for (const cohort of cohorts) {
        const cohortSnap = await db.collection('users')
            .where('cohort', '==', cohort)
            .aggregate({
            totalChats: admin.firestore.AggregateField.sum('chatMessagesSent'),
            totalCompleted: admin.firestore.AggregateField.sum('modulesCompleted'),
        }).get();
        const chats = cohortSnap.data().totalChats || 0;
        const completed = cohortSnap.data().totalCompleted || 0;
        mentorAiReliance[cohort] = completed > 0 ? chats / completed : 0;
    }
    // 8. League Distribution (Metric 8)
    const bronzeCountSnap = await db.collection('users').where('league', '==', 'bronze').count().get();
    const silverCountSnap = await db.collection('users').where('league', '==', 'silver').count().get();
    const goldCountSnap = await db.collection('users').where('league', '==', 'gold').count().get();
    const bronze = bronzeCountSnap.data().count || 0;
    const silver = silverCountSnap.data().count || 0;
    const gold = goldCountSnap.data().count || 0;
    // 9. Weekly XP Burn Rate (Metric 9)
    const sevenDaysAgoXp = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const xpLogsSnap = await db.collection('xp_transactions')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgoXp))
        .get();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const burnMap = {
        'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
    };
    xpLogsSnap.forEach((doc) => {
        var _a;
        const data = doc.data();
        const timestamp = (_a = data.timestamp) === null || _a === void 0 ? void 0 : _a.toDate();
        if (timestamp) {
            const dayName = daysOfWeek[timestamp.getDay()];
            burnMap[dayName] = (burnMap[dayName] || 0) + (data.amount || 0);
        }
    });
    const weeklyXpBurnRate = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayName = daysOfWeek[date.getDay()];
        weeklyXpBurnRate.push({
            day: dayName,
            xp: burnMap[dayName] || 0
        });
    }
    // 10. Broken Link SLA (Metric 10)
    const totalResourcesSnap = await db.collection('resources').count().get();
    const reportedDeadLinksSnap = await db.collection('dead_links').count().get();
    const totalResources = totalResourcesSnap.data().count || 0;
    const reportedDeadLinks = reportedDeadLinksSnap.data().count || 0;
    const slaPercentage = totalResources > 0
        ? Math.max(0, ((totalResources - reportedDeadLinks) / totalResources) * 100)
        : 100;
    // Compile and write atomically to analytics_reports/latest
    const reportPayload = {
        savingsTracker: {
            webGpuPercent,
            groqPercent,
            webGpuCount,
            groqCount,
        },
        costPerLearner: {
            totalActiveUsers,
            estimatedCostPerLearner,
            totalOperations,
        },
        securityIntercepts: {
            totalBlocked,
            emails,
            tokens,
            networking,
            credentials,
        },
        curriculumHeatmap,
        skillVelocity: {
            averageDeltaSeconds,
            totalCompletedModules: completedCount,
        },
        frictionNode: {
            mostAbandonedNode,
            abandonedCount,
        },
        mentorAiReliance,
        leagueDistribution: {
            bronze,
            silver,
            gold,
        },
        weeklyXpBurnRate,
        brokenLinkSla: {
            totalResources,
            reportedDeadLinks,
            slaPercentage,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('analytics_reports').doc('latest').set(reportPayload);
}
//# sourceMappingURL=index.js.map