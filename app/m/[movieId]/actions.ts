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
  db: Firestore,
  collectionName: string,
  docId: string,
  onUpdate: (data: T | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  
  // Create a reference to the specific document with the generic type
  const docRef = doc(db, collectionName, docId) as DocumentReference<T>;

  // onSnapshot returns an 'Unsubscribe' function
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        // Document exists, pass its typed data to the callback
        // docSnap.data() is of type T
        onUpdate(docSnap.data());
      } else {
        // Document does not exist (or was deleted)
        console.warn(`Document ${collectionName}/${docId} does not exist.`);
        onUpdate(null); // Pass null to the callback
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