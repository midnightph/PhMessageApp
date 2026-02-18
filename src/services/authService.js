import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
const provider = new GoogleAuthProvider();

export async function login(email, password) {
  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" };
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    return { error: error.message };
  }  
  return { success: true };
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);

    return {
      success: true,
      user: result.user
    };

  } catch (error) {
    return {
      error: error.message
    };
  }
}