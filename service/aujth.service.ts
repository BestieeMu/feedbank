import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (router: ReturnType<typeof useRouter>) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Reference to the user's document
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // If user does not exist, create the user doc
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
      });
    }

    // Route the user to the dashboard after successful login
    router.push('/dashboard');

    return user;
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

export const logout = async (router: ReturnType<typeof useRouter>) => {
  try {
    await signOut(auth);
    router.push('/');
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
