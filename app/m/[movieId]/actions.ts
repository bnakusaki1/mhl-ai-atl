import { db } from "@/firebase.config";
import {
  doc,
  onSnapshot,
  Firestore,
  DocumentData,
  Unsubscribe,
  DocumentReference,
} from "firebase/firestore";

/**
 * Listens for real-time updates on a specific Firestore document.
 *
 * @param db - The Firestore database instance.
 * @param collectionName - The name of the collection.
 * @param docId - The ID of the document to listen to.
 * @param onUpdate - Callback function to run when the data changes.
 * It receives the document data (or null if it doesn't exist).
 * @param onError - (Optional) Callback function to run if an error occurs.
 * @returns An Unsubscribe function to stop the listener.
 */
export const listenToDocument = <T extends DocumentData>(
  onUpdate: (bpm: number) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  // Create a reference to the specific document with the generic type
  const docRef = doc(db, "BPMReadings", "readings");

  // onSnapshot returns an 'Unsubscribe' function
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data().BPM);
      } else {
        console.log("Values");
      }
    },
    (error) => {
      // Handle any errors
      console.error("Error listening to document:", error);
      if (onError) {
        onError(error);
      }
    }
  );

  // Return the unsubscribe function
  return unsubscribe;
};
