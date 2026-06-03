import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize firebase admin using service account if available, or environment defaults
if (admin.apps.length === 0) {
    const projectId = process.env.GCLOUD_PROJECT || 'cogniflow-f35aa';
    
    // Look for service account json in current directory or parent directory
    let serviceAccountPath: string | null = null;
    const searchDirs = [process.cwd(), path.join(__dirname, '..'), path.join(__dirname, '../..')];
    
    for (const dir of searchDirs) {
        try {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                const saFile = files.find(f => f.includes('firebase-adminsdk') && f.endsWith('.json'));
                if (saFile) {
                    serviceAccountPath = path.join(dir, saFile);
                    break;
                }
            }
        } catch (e) {
            // Ignore readdir / existsSync issues
        }
    }

    if (serviceAccountPath) {
        console.log(`[INFO] Found service account file at: ${serviceAccountPath}`);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
            projectId
        });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        console.log(`[INFO] Initializing using GOOGLE_APPLICATION_CREDENTIALS env var.`);
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId
        });
    } else {
        try {
            console.log(`[INFO] Attempting default initialization...`);
            admin.initializeApp();
        } catch (error) {
            console.log(`[WARNING] Default initialization failed. Falling back to project ID: ${projectId}`);
            admin.initializeApp({ projectId });
        }
    }
}

/**
 * Assigns administrative custom claims to a target user.
 * @param uid The unique identifier (UID) of the user in Firebase Authentication.
 */
export async function setAdminClaim(uid: string): Promise<void> {
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
    } catch (error: any) {
        console.error("Failed to set custom admin claims:", error.message || error);
    }
}

// Run if called directly from CLI (e.g. npx tsx src/setAdminClaimScript.ts <target-uid>)
const args = process.argv.slice(2);
const targetUid = args[0];
if (targetUid) {
    setAdminClaim(targetUid);
} else {
    console.log("Usage: npx tsx src/setAdminClaimScript.ts <target-uid>");
}
