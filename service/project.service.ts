import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const addProject = async (userId: string, title: string) => {
  if (!userId || !title.trim()) return;

  try {
    const projectRef = collection(db, "users", userId, "projects");
    await addDoc(projectRef, {
      title,
      createdAt: Timestamp.now(),
    });

    console.log("Project added successfully");
  } catch (error) {
    console.error("Error adding project:", error);
  }
};
