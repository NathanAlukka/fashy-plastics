import type{FirebaseOptions}from'firebase/app';

// Firebase's web configuration identifies the project; authorization is enforced
// by Authentication and Firestore Security Rules, never by hiding these values.
export const firebaseConfig:FirebaseOptions={
  apiKey: "AIzaSyATQBfgkHze2gfZzExdeBYuAFHLCZAVZlQ",
  authDomain: "fashy-plastics.firebaseapp.com",
  projectId: "fashy-plastics",
  storageBucket: "fashy-plastics.firebasestorage.app",
  messagingSenderId: "902486037575",
  appId: "1:902486037575:web:7ba04a817a549a8017cd62"
};

export const firebaseConfigured=Boolean(firebaseConfig.apiKey&&firebaseConfig.projectId&&firebaseConfig.appId);