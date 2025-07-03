import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";

const firebaseConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

let firebaseInstance: App;
let storage: Storage;

// Prevent re-initialization
if (!getApps().length) {
  firebaseInstance = initializeApp(firebaseConfig);
  storage = getStorage(firebaseInstance);
} else {
  // If an app is already initialized, retrieve it to avoid errors
  // Important if using hot-reloading or server-side rendering
  firebaseInstance = getApp();
  storage = getStorage(firebaseInstance);
}

export { firebaseInstance, storage };
