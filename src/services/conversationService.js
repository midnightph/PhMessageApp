// services/conversationService.js

import { db } from "./firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export async function getUserConversations(uid) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
