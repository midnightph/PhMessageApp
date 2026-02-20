import { db } from "./firebase";
import {
  collection,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  limit,
  startAfter,
  getDocs, where
} from "firebase/firestore";
import { auth } from "./firebase";

const PAGE_SIZE = 20;

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

export async function getMessagesPage(conversationId, lastDoc = null) {
  let q;

  if (lastDoc) {
    q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("sendAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );
  } else {
    q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("sendAt", "desc"),
      limit(PAGE_SIZE)
    );
  }

  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return {
    messages: messages.reverse(),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === PAGE_SIZE
  };
}

export function listenNewMessages(conversationId, callback) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("sendAt", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        callback({
          id: change.doc.id,
          ...change.doc.data()
        });
      }
    });
  });
}

export async function sendMessage(id, message) {
  const user = auth.currentUser;
  if (!user) return;

  const trimmed = message.trim();
  if (!trimmed) return;

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