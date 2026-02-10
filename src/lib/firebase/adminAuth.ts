import { getAdminAuth, getAdminDb } from './admin';

export async function requireAdmin(authHeader: string | null) {
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Missing auth token');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const roles = (userDoc.data()?.roles || []) as string[];

    if (!roles.includes('admin')) {
        throw new Error('Forbidden');
    }

    return { uid: decoded.uid, email: decoded.email || '' };
}

export async function requireAdminOrTreasurer(authHeader: string | null) {
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Missing auth token');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const roles = (userDoc.data()?.roles || []) as string[];

    if (!roles.includes('admin') && !roles.includes('treasurer')) {
        throw new Error('Forbidden');
    }

    return { uid: decoded.uid, email: decoded.email || '' };
}
