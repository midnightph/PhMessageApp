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
  getDocs, where,
  getDoc
} from "firebase/firestore";
import { auth } from "./firebase";
import { storage } from "./firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

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
    type: "text",
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

export async function createConversation(participantEmail) {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "users"),
    where("email", "==", participantEmail)
  );

  const snap = await getDocs(q);

  if (snap.docs.length === 0) return alert("Usuário não encontrado!");
  const docSnap = snap.docs[0];
  const data = docSnap.data();
  const participantUid = docSnap.id;

  if (participantUid === user.uid) {
    alert("Você não pode criar uma conversa consigo mesmo!");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userDoc = userSnap.data();

  const existing = await getChat(user.uid, participantUid);
  if (existing) return alert("Conversa já existe!");

  const newConv = {
    participants: [user.uid, participantUid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
    lastMessageSender: user.uid,
    participantsInfo: {
      [user.uid]: {
        name: userDoc.name || "Usuário",
        photo: userDoc.photo || "https://i.pravatar.cc/150?img=1"
      },
      [participantUid]: {
        name: data.name || "Usuário",
        photo: data.photo || "https://i.pravatar.cc/150?img=2"
      }
    }
  };

  const docRef = await addDoc(collection(db, "conversations"), newConv);
  return docRef.id;
}

export async function getChat(uid1, uid2) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid1)
  );

  const snap = await getDocs(q);
  return snap.docs.find(doc =>
    doc.data().participants.includes(uid2)
  );
}

export async function createChatWithDev(uid) {

  const DEV_UID = "Z5PzjD2qDgTuWZqYxpq4KwKz6K23";

  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid)
  );

  const snap = await getDocs(q);

  const existing = snap.docs.find(doc =>
    doc.data().participants.includes(DEV_UID)
  );

  if (existing) {
    return existing.id;
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  const devRef = doc(db, "users", DEV_UID);
  const devSnap = await getDoc(devRef);

  const newConv = {
    participants: [uid, DEV_UID],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
    lastMessageSender: uid,
    participantsInfo: {
      [uid]: {
        name: userSnap.data()?.name || "Usuário",
        photo: userSnap.data()?.photo || "https://i.pravatar.cc/150?img=1"
      },
      [DEV_UID]: {
        name: "Desenvolvedor",
        photo: devSnap.data()?.photo || "https://i.pravatar.cc/150?img=2"
      }
    }
  };

  await addDoc(collection(db, "conversations"), newConv);
}

export async function sendFileMessage(conversationId, file) {
  if (!file) return;



  const user = auth.currentUser;

  // 1. cria caminho único
  const storageRef = ref(
    storage,
    `conversations/${conversationId}/${Date.now()}_${file.name}`
  );

  // 2. upload
  const snapshot = await uploadBytes(storageRef, file);

  // 3. pega url pública
  const downloadURL = await getDownloadURL(snapshot.ref);

  // 4. detectar tipo
  let type = "file";
  if (file.type.startsWith("image")) type = "image";
  else if (file.type.startsWith("video")) type = "video";

  // 5. salvar mensagem no Firestore
  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      type,
      fileUrl: downloadURL,
      fileName: file.name,
      fileSize: file.size,
      senderId: user.uid,
      sendAt: serverTimestamp()
    }
  );
}