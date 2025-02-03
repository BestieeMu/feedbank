import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const addReply = async (userId: string, projectId: string, feedbackId: string, replyData: any) => {
  if (!userId || !projectId || !feedbackId || !replyData.comment.trim()) return;

  try {
    const replyRef = collection(db, "users", userId, "projects", projectId, "feedbacks", feedbackId, "replies");
    await addDoc(replyRef, {
      profileURL: replyData.profileURL,
      name: replyData.name,
      date: Timestamp.now(),
      comment: replyData.comment,
    });

    console.log("Reply added successfully");
  } catch (error) {
    console.error("Error adding reply:", error);
  }
};
