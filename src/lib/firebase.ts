import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add your Firebase configuration object here
// You can find this in your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyBAxzqDTbfp4BOJyFKooLUED2hJtJ0AgzY",
  authDomain: "vibecodeyy.firebaseapp.com",
  projectId: "vibecodeyy",
  storageBucket: "vibecodeyy.firebasestorage.app",
  messagingSenderId: "607760679447",
  appId: "1:607760679447:web:6ca2a5f339707cfaf89252",
  measurementId: "G-3W5L81VLQX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };