import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const router = useRouter();
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
    router.push("/dashboard");
    return user;
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
