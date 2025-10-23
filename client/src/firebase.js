// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Import the auth services we need
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMS8CFEID8hyemeAZ0SNS7T1sxgZ4CVvI",
  authDomain: "ai-resume-builder-2da43.firebaseapp.com",
  projectId: "ai-resume-builder-2da43",
  storageBucket: "ai-resume-builder-2da43.firebasestorage.app",
  messagingSenderId: "350454281423",
  appId: "1:350454281423:web:dd56b961b546386a3533ba",
  measurementId: "G-VZ6TQT9GY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize the Google Auth provider
export const googleProvider = new GoogleAuthProvider();

export default app;