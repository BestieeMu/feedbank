import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const addFeedback = async (userId: string, projectId: string, feedbackData: any) => {
  if (!userId || !projectId || !feedbackData.title.trim()) return;

  try {
    const feedbackRef = collection(db, "users", userId, "projects", projectId, "feedbacks");
    await addDoc(feedbackRef, {
      title: feedbackData.title,
      description: feedbackData.description,
      votes: feedbackData.votes || 0,
      status: feedbackData.status || "pending",
      profileURL: feedbackData.profileURL,
      name: feedbackData.name,
      date: Timestamp.now(),
    });

    console.log("Feedback added successfully");
  } catch (error) {
    console.error("Error adding feedback:", error);
  }
};
