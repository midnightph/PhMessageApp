import { getDatabase, ref, set, onDisconnect } from "firebase/database";
import { auth } from "./firebase";

const database = getDatabase();

export function setupPresence() {
  const user = auth.currentUser;
  if (!user) return;

  const userStatusRef = ref(database, `status/${user.uid}`);

  const isOnline = {
    state: "online",
    lastChanged: Date.now(),
  };

  const isOffline = {
    state: "offline",
    lastChanged: Date.now(),
  };

  onDisconnect(userStatusRef).set(isOffline);

  set(userStatusRef, isOnline);
}