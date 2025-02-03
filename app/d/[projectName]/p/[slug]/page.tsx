"use client";
import { db } from "@/lib/firebase";
import {
  query,
  collection,
  where,
  getDocs,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [addingComment, setAddingComment] = useState<any>(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [comments, setComments] = useState<any>([]);
  const [newComment, setNewComment] = useState("");
  const projectName = params.projectName;
  const slug = params.slug;

  useEffect(() => {
    if (!projectName) return;
    setIsLoadingFeedbacks(true);
    
    const fetchProject = async () => {
      try {
        const q = query(collection(db, "projects"), where("name", "==", projectName));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return;
        
        const docSnap = querySnapshot.docs[0];
        const feedbackRef = query(
          collection(db, "projects", docSnap.id, "feedbacks"),
          where("slug", "==", slug)
        );
        
        const unsubFeedback = onSnapshot(feedbackRef, (querySnapshot) => {
          const feedbackList = querySnapshot.docs.map((doc) => ({ id: doc.id, projectId: docSnap.id, ...doc.data() }));
          if (feedbackList.length > 0) {
            setFeedback(feedbackList[0]);
            const commentsRef = collection(db, "projects", docSnap.id, "feedbacks", feedbackList[0].id, "comments");
            const unsubComments = onSnapshot(commentsRef, (querySnapshot) => {
              setComments(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            });
            return () => unsubComments();
          }
        });
        return () => unsubFeedback();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingFeedbacks(false);
      }
    };

    fetchProject();
  }, [projectName, slug]);

  const handleAddComment = async () => {
    if (!feedback || !newComment.trim()) return;
    setAddingComment(true);
    try {
      const commentsRef = collection(db, "projects", feedback.projectId, "feedbacks", feedback.id, "comments");
      await addDoc(commentsRef, { text: newComment, createdAt: new Date().toISOString() });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <>
      <header className="py-7 w-full bg-white">
        <div className="flex justify-between max-w-5xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center text-gray-700 font-semibold bg-gray-200 px-4 py-2 rounded-lg">
            ⬅️ Back
          </button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto p-6 flex items-start gap-10 rounded-lg">
        {isLoadingFeedbacks ? (
          <p>Loading feedback...</p>
        ) : (
          <>
            <div className="w-7/12">
              <div className="flex gap-10 items-start">
                <button className="px-3 py-1 rounded-lg bg-gray-200" disabled>
                  ▲ {feedback?.votes || 0}
                </button>
                <div>
                  <h3 className="font-bold text-xl">{feedback?.title}</h3>
                  <p className="text-gray-500">{feedback?.description}</p>
                </div>
              </div>
            </div>
            <div className="w-full">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment"
                className="w-full h-24 p-3 resize-none rounded-sm border"
              />
              <button onClick={handleAddComment} className="bg-black text-white px-4 py-2 rounded-md">
                {addingComment ? "Adding..." : "Add Comment"}
              </button>
              <div className="w-full space-y-2 ">
                {comments.length === 0 ? <div className="bg-white rounded-md px-4 mt-5 py-6">No comments yet.</div> : comments.map((comment: any) => (
                  <div key={comment.id} className="border-b bg-white rounded-md px-4 mt-5 py- py-2">
                    <p>{comment.text}</p>
                    <p className="text-gray-400 text-sm">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Page;