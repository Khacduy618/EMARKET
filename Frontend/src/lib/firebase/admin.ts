import admin from 'firebase-admin';

interface ServiceAccount {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
};

function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const adminApp = initializeAdminApp();

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth, adminApp };