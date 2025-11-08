// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu6oFWZ-JZm3h6M0oMDEHcG-nFqheJCN0",
  authDomain: "biotune-97203.firebaseapp.com",
  projectId: "biotune-97203",
  storageBucket: "biotune-97203.firebasestorage.app",
  messagingSenderId: "724385119086",
  appId: "1:724385119086:web:5359e0e7a94ec81650df7f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
