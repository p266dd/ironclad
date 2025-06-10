import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Interface for firebaseConfig
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId?: string | undefined;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDERID,
  appId: process.env.FIREBASE_APP_ID,
};

let firebaseInstance: FirebaseApp;
let storage: FirebaseStorage;

// Prevent re-initialization
if (!getApps().length) {
  firebaseInstance = initializeApp(firebaseConfig);
  storage = getStorage(firebaseInstance);
} else {
  // If an app is already initialized, retrieve it to avoid errors
  // Important if using hot-reloading or server-side rendering
  firebaseInstance = getApps()[0];
  storage = getStorage(firebaseInstance);
}

export { firebaseInstance, storage };
