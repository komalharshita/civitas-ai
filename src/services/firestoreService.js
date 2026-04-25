import { collection, getDocs } from "firebase/firestore";
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