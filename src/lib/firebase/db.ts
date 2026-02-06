import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    QueryConstraint
} from 'firebase/firestore';
import { db } from './config';

/**
 * Generic function to get a document by ID
 */
export async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    } catch (error) {
        console.error(`Error getting document from ${collectionName}:`, error);
        return null;
    }
}

/**
 * Generic function to get all documents from a collection with optional filters
 */
export async function getDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
): Promise<T[]> {
    try {
        const collectionRef = collection(db, collectionName);
        const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
    } catch (error) {
        console.error(`Error getting documents from ${collectionName}:`, error);
        return [];
    }
}

/**
 * Generic function to add a document
 * NOTE: For financial operations, use API routes instead!
 */
export async function addDocument<T>(collectionName: string, data: Partial<T>): Promise<string | null> {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            created_at: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        return null;
    }
}

/**
 * Generic function to update a document
 * NOTE: For financial operations, use API routes instead!
 */
export async function updateDocument(
    collectionName: string,
    id: string,
    data: Record<string, any>
): Promise<boolean> {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, data);
        return true;
    } catch (error) {
        console.error(`Error updating document in ${collectionName}:`, error);
        return false;
    }
}

/**
 * Generic function to delete a document
 */
export async function deleteDocument(collectionName: string, id: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, collectionName, id));
        return true;
    } catch (error) {
        console.error(`Error deleting document from ${collectionName}:`, error);
        return false;
    }
}

/**
 * Get recent announcements
 */
export async function getRecentAnnouncements(limitCount: number = 5) {
    return getDocuments('announcements', [
        orderBy('created_at', 'desc'),
        limit(limitCount)
    ]);
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(limitCount: number = 5) {
    return getDocuments('events', [
        where('event_date', '>=', Timestamp.now()),
        orderBy('event_date', 'asc'),
        limit(limitCount)
    ]);
}

/**
 * Get contributions for a specific year
 */
export async function getContributionsByYear(year: number) {
    return getDocuments('contributions', [
        where('year', '==', year),
        orderBy('status', 'asc')
    ]);
}

/**
 * Get recent expenses
 */
export async function getRecentExpenses(limitCount: number = 10) {
    return getDocuments('expenses', [
        orderBy('expense_date', 'desc'),
        limit(limitCount)
    ]);
}
