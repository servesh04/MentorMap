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
exports.setAdminClaim = setAdminClaim;
const admin = __importStar(require("firebase-admin"));
// Initialize firebase admin using environment default credentials, emulator settings, or explicit fallback projectId
if (admin.apps.length === 0) {
    const projectId = process.env.GCLOUD_PROJECT || 'cogniflow-f35aa';
    try {
        // Try default initialization (works with service account file or in Cloud Functions environment)
        admin.initializeApp();
    }
    catch (error) {
        // Fallback to explicit project configuration (useful for emulator or credential-less verification)
        console.log(`[WARNING] Default initialization failed. Falling back to project ID: ${projectId}`);
        admin.initializeApp({ projectId });
    }
}
/**
 * Assigns administrative custom claims to a target user.
 * @param uid The unique identifier (UID) of the user in Firebase Authentication.
 */
async function setAdminClaim(uid) {
    if (!uid) {
        console.error("Error: Please provide a valid User ID (UID).");
        return;
    }
    try {
        console.log(`Checking status for user UID: ${uid}...`);
        // Assert user exists first
        const userRecord = await admin.auth().getUser(uid);
        console.log(`User found: ${userRecord.displayName || 'Scholar'} (${userRecord.email})`);
        console.log(`Assigning { admin: true } claim to user...`);
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        // Confirm writing succeeded by refetching claims
        const updatedUser = await admin.auth().getUser(uid);
        console.log(`[CONFIRMATION] Successfully set custom admin claim for user.`);
        console.log(`Current Claims: ${JSON.stringify(updatedUser.customClaims, null, 2)}`);
        console.log(`\nNOTE: The user must force refresh their ID token (e.g. user.getIdTokenResult(true) or log out and log back in) on their next session to apply the changes.`);
    }
    catch (error) {
        console.error("Failed to set custom admin claims:", error.message || error);
    }
}
// Run if called directly from CLI (e.g. npx tsx src/setAdminClaimScript.ts <target-uid>)
const args = process.argv.slice(2);
const targetUid = args[0];
if (targetUid) {
    setAdminClaim(targetUid);
}
else {
    console.log("Usage: npx tsx src/setAdminClaimScript.ts <target-uid>");
}
//# sourceMappingURL=setAdminClaimScript.js.map