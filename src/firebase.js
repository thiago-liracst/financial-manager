// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJXSmJC2aJJEk0u7PMwjnGHf_o1v8hX4w",
  authDomain: "financial-manager-7b4ae.firebaseapp.com",
  projectId: "financial-manager-7b4ae",
  storageBucket: "financial-manager-7b4ae.firebasestorage.app",
  messagingSenderId: "123143604326",
  appId: "1:123143604326:web:e2ed11eaf2461f032785a7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
