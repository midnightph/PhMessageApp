// services/conversationService.js

import { db } from "./firebase";
import { collection, query, where, orderBy, getDocs, serverTimestamp, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { auth } from "./firebase";

export function getUserConversations(uid, callback) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(conversations);
  });

  return unsubscribe;
}

export async function getMessages(id, callback) {
  const q = query(
    collection(
      db,
      "conversations",
      id,
      "messages"
    ),
    orderBy("sendAt", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(msgs);
  });

  return () => unsubscribe();
}

export async function sendMessage(id, message) {
  const user = auth.currentUser;
  if (!user) return;
  if (!message) return;

  const trimmed = message.trim();

  const messageContent = {
    text: trimmed,
    sendAt: serverTimestamp(),
    senderId: user.uid
  };

  await addDoc(
    collection(db, "conversations", id, "messages"),
    messageContent
  );

  const preview =
    trimmed.length > 30
      ? trimmed.slice(0, 30) + "..."
      : trimmed;

  await updateDoc(doc(db, "conversations", id), {
    updatedAt: serverTimestamp(),
    lastMessage: preview,
    lastMessageSender: user.uid
  });
}