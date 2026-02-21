import { db, auth } from "./firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  updateDoc
} from "firebase/firestore";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function getUserData(user) {
  const userRef = await doc(db, "users", user.uid);
  return await getDoc(userRef);
}

export async function handlePhotoChange(file) {
  const imageRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);

  await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(imageRef);

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    photo: downloadURL
  });

  const q = query(collection(db, "conversations"), where("participants", "array-contains", auth.currentUser.uid));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const conversationRef = doc(db, "conversations", docSnap.id);
    updateDoc(conversationRef, {
      [`participantsInfo.${auth.currentUser.uid}.photo`]: downloadURL
    });
  });

  return downloadURL;
}

export async function updateUserName(uid, newName) {
  const batch = writeBatch(db);

  // 1️⃣ Atualiza o nome no documento do usuário
  const userRef = doc(db, "users", uid);
  batch.update(userRef, {
    name: newName
  });

  // 2️⃣ Busca todas as conversas onde ele participa
  const conversationsRef = collection(db, "conversations");
  const q = query(conversationsRef, where("participants", "array-contains", uid));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const conversationRef = doc(db, "conversations", docSnap.id);

    batch.update(conversationRef, {
      [`participantsInfo.${uid}.name`]: newName
    });
  });

  // 3️⃣ Executa tudo junto
  await batch.commit();
}