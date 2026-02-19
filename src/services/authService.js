import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
const provider = new GoogleAuthProvider();

export async function login(email, password) {
  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" };
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(auth.currentUser);
  } catch (error) {
    switch (error.code) {
      case "auth/invalid-email":
        return { error: "Email inválido" };
      case "auth/user-not-found":
        return { error: "Email ou senha incorretos" };
      case "auth/invalid-credential":
        return { error: "Email ou senha incorretos" };
      case "auth/too-many-requests":
        return { error: "Muitas tentativas. Tente novamente mais tarde" };
      default:
        return { error: "Erro ao autenticar" };
    }
  }
  return { success: true, user: auth.currentUser };
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    await ensureUserDocument(result.user);
    return {
      success: true,
      user: result.user
    };

  } catch (error) {

    let message;

    switch (error.code) {
      case "auth/popup-closed-by-user":
        message = "O popup foi fechado.";
        break;

      case "auth/popup-blocked":
        message = "O navegador bloqueou o popup. Permita popups para continuar.";
        break;

      case "auth/network-request-failed":
        message = "Erro de conexão. Verifique sua internet.";
        break;

      case "auth/too-many-requests":
        message = "Muitas tentativas. Tente novamente mais tarde.";
        break;

      default:
        message = "Erro ao autenticar com Google.";
    }
    return { error: message };
  }
}

export async function signUp(email, password, confirmPassword, name) {
  if (password !== confirmPassword) {
    return { error: "As senhas devem ser iguais" };
  }
  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" };
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(result.user, { name });
    return { success: true, user: result.user };
  } catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return { error: "Email já cadastrado" };
      case "auth/invalid-email":
        return { error: "Email inválido" };
      case "auth/weak-password":
        return { error: "Senha fraca" };
      case "auth/too-many-requests":
        return { error: "Muitas tentativas. Tente novamente mais tarde" };
      default:
        return { error: "Erro ao cadastrar" };
    }
  }
}

export async function recoverPassword(email) {
  if (!email) {
    return { error: "Email obrigatório" };
  }
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    switch (error.code) {
      case "auth/invalid-email":
        return { error: "Email inválido" };
      case "auth/user-not-found":
        return { error: "Email não cadastrado" };
      case "auth/too-many-requests":
        return { error: "Muitas tentativas. Tente novamente mais tarde" };
      default:
        return { error: "Erro ao recuperar senha" };
    }
  }
}

export async function ensureUserDocument(user, extraData = {}) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || extraData.name || "Usuário",
      email: user.email,
      photo: user.photoURL || "https://i.pravatar.cc/150?img=3",
      createdAt: new Date()
    });
  }
}