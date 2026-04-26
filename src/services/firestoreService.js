import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const getVolunteers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "volunteers"));
    const volunteers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return volunteers;
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    return [];
  }
};

/**
 * Mark an issue as resolved in Firestore.
 * Falls back gracefully if the issue ID is not a valid Firestore doc ID.
 */
export const resolveIssue = async (issueId) => {
  if (!issueId) throw new Error('No issue ID provided');
  try {
    const ref = doc(db, 'issues', issueId);
    await updateDoc(ref, { status: 'resolved', resolvedAt: serverTimestamp() });
  } catch (error) {
    console.error('[resolveIssue] Firestore error:', error);
    throw error;
  }
};

/**
 * Add a new volunteer document to Firestore.
 */
export const addVolunteer = async (volunteerData) => {
  try {
    const ref = await addDoc(collection(db, 'volunteers'), {
      ...volunteerData,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    console.error('[addVolunteer] Firestore error:', error);
    throw error;
  }
};