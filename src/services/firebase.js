// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDThO8PQsXFbzNMtct_9iViTY3UWYzPU4Y",
  authDomain: "phmessageapp-6f134.firebaseapp.com",
  projectId: "phmessageapp-6f134",
  storageBucket: "phmessageapp-6f134.firebasestorage.app",
  messagingSenderId: "148180098214",
  appId: "1:148180098214:web:abecd886104d539a3ae867",
  measurementId: "G-1G3JE92P7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth };