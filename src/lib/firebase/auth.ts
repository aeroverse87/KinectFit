"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./config";

export const signUp = (email: string, password: string) => {
  if (!auth) throw new Error("Firebase not configured");
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
  if (!auth) throw new Error("Firebase not configured");
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = () => {
  if (!auth) throw new Error("Firebase not configured");
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signOut = () => {
  if (!auth) throw new Error("Firebase not configured");
  return firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
