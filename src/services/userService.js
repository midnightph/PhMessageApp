// services/userService.js
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getUserData(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return null;

  return snap.data();
}
