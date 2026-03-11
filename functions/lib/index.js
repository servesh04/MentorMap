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
exports.resolveWeeklyLeagues = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
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
//# sourceMappingURL=index.js.map