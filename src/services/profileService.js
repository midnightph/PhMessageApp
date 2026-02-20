import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export async function getUserData(user) {
    const userRef = await doc(db, "users", user.uid);
    return await getDoc(userRef);
}