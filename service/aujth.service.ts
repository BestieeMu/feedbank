import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    // Start the sign-in flow
    await signInWithRedirect(auth, provider);

    // Wait for the user to be redirected back to your app
    const result = await getRedirectResult(auth);

    if (result) {
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

      return user;
    }
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
