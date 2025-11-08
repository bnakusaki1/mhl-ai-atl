import { db } from './firebase';
import { ref, set, get } from 'firebase/database';

export async function testFirebaseConnection() {
  try {
    // Try to write test data
    const testRef = ref(db, 'test/connection');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Firebase connected!'
    });
    
    // Try to read it back
    const snapshot = await get(testRef);
    
    if (snapshot.exists()) {
      console.log('✅ Firebase connected successfully!');
      console.log('Data:', snapshot.val());
      return true;
    } else {
      console.log('❌ Could not read data');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection error:', error);
    return false;
  }
}