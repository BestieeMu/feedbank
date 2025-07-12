"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  arrayRemove,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import React from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { signInWithGoogle } from "@/service/aujth.service";
import { useRouter } from "next/navigation";

export type Feedback = {
  id: string;
  title: string;
  description: string;
  votes: number;
  voters: [];
  date: string;
  profileUrl: string;
  name: string;
  status: string;
  commentCount?: any;
};

const ProjectDetails = ({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) => {
  const router = useRouter();

  const [project, setProject] = useState<{ id: string; title: string } | null>(
    null
  );

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
  });
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isPostingFeedback, setIsPostingFeedback] = useState(false);
  const [votedFeedbacks, setVotedFeedbacks] = useState<{
    [key: string]: boolean;
  }>({});
  const [votingLoading, setVotingLoading] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    setMounted(true);
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const fetchProject = async () => {
      let projectName = (await params).projectName;
      projectName = decodeURIComponent(projectName); // <-- decode URL param
      setIsLoadingFeedbacks(true);
      try {
        if (projectName) {
          const q = query(
            collection(db, "projects"),
            where("name", "==", projectName)
          );
          const querySnapshot = await getDocs(q);
          const docSnap = querySnapshot.docs[0];

          if (docSnap.exists()) {
            setProject({ id: docSnap.id, title: docSnap.data().name });

            // Fetch feedbacks
            const feedbackRef = collection(
              db,
              "projects",
              docSnap.id,
              "feedbacks"
            );
            const unsub = onSnapshot(feedbackRef, async (querySnapshot) => {
              const feedbackList = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                  const commentsRef = collection(
                    db,
                    "projects",
                    docSnap.id,
                    "feedbacks",
                    doc.id,
                    "comments"
                  );
                  const commentsSnapshot = await getDocs(commentsRef);
                  return {
                    id: doc.id,
                    ...doc.data(),
                    commentCount: commentsSnapshot.size, // Get the number of comments
                  } as Feedback;
                })
              );
              setFeedbacks(feedbackList);
            });

            // Load voted feedbacks from local storage
            const storedVotes = JSON.parse(
              localStorage.getItem("votedFeedbacks") || "{}"
            );
            setVotedFeedbacks(storedVotes);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingFeedbacks(false);
      }
    };

    fetchProject();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setOpen(true);
      return;
    }

    setIsPostingFeedback(true);

    if (!newFeedback.title || !newFeedback.description || !project) {
      setIsPostingFeedback(false);
      return;
    }

    const feedbackRef = collection(db, "projects", project.id, "feedbacks");
    const slug = newFeedback.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    const feedbackDoc = await addDoc(feedbackRef, {
      title: newFeedback.title,
      slug: slug,
      description: newFeedback.description,
      votes: 0,
      voters: [],
      date: new Date().toISOString(),
      profileUrl:
        user?.photoURL ||
        "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-855.jpg?t=st=1738700321~exp=1738703921~hmac=0c36cca7bb1749aaf68936ff46083922d5cf86792399d7c0988e288be729594d&w=740",
      name: user?.displayName,
      status: "New",
    });

    setFeedbacks([
      {
        id: feedbackDoc.id,
        title: newFeedback.title,
        description: newFeedback.description,
        votes: 0,
        voters: [],
        date: new Date().toISOString(),
        profileUrl:
          user?.photoURL ||
          "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-855.jpg?t=st=1738700321~exp=1738703921~hmac=0c36cca7bb1749aaf68936ff46083922d5cf86792399d7c0988e288be729594d&w=740",
        name: user?.displayName,
        status: "New",
      },
      ...feedbacks,
    ]);

    setNewFeedback({ title: "", description: "" });
    setIsPostingFeedback(false);
  };

  const handleVote = async (feedbackId: string, currentVotes: number) => {
    if (!user) {
      setOpen(true);
      return;
    }
    if (!project) return;

    setVotingLoading((prev) => ({ ...prev, [feedbackId]: true }));

    try {
   if (user) {
    const feedbackRef = doc(
      db,
      "projects",
      project.id,
      "feedbacks",
      feedbackId
    );
    const feedbackDocSnap = await getDoc(feedbackRef);
    const voters = feedbackDocSnap?.data()?.voters;

    // Check if user has already voted
    const hasVoted = voters.includes(user?.uid);

    // Toggle vote
    const newVotes = hasVoted ? currentVotes - 1 : currentVotes + 1;
    await updateDoc(feedbackRef, {
      votes: newVotes,
      voters: hasVoted ? arrayRemove(user?.uid) : arrayUnion(user?.uid),
    });

    // Update state
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === feedbackId ? { ...fb, votes: newVotes } : fb
      )
    );
   }
    } catch (error) {
      console.error("Error updating vote:", error);
    } finally {
      setVotingLoading((prev) => ({ ...prev, [feedbackId]: false }));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="w-full py-7">
            <Button onClick={() => signInWithGoogle(router)} className="w-full">
              Signin with google
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <header className="py-7 w-full bg-white ">
        <div className="flex px-6 md:p-4 justify-between max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold">⬆️ {project?.title}</h3>
          <div><Link href={"/d/FeedBank"}>💡Feedback</Link></div>
        </div>
      </header>
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-start">
          {!mounted ? null : (
            project ? (
              <>
                {/* Feedback Form */}
                <div className="bg-white w-full md:w-5/12 p-6 rounded-lg shadow-lg mt-6">
                  <h2 className="text-xl font-bold mb-4">Post a Feedback</h2>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      placeholder="Short, descriptive title"
                      value={newFeedback.title}
                      onChange={(e) =>
                        setNewFeedback({ ...newFeedback, title: e.target.value })
                      }
                      className="w-full border p-2 rounded-lg outline-none mb-3 text-gray-700"
                    />
                    <textarea
                      placeholder="Description"
                      value={newFeedback.description}
                      onChange={(e) =>
                        setNewFeedback({
                          ...newFeedback,
                          description: e.target.value,
                        })
                      }
                      className="w-full border resize-none outline-none p-2 rounded-lg mb-3 text-gray-700"
                    />
                    <Button
                      type="submit"
                      className="w-full text-white font-semibold py-2 rounded-lg transition"
                      disabled={isPostingFeedback}
                    >
                      {isPostingFeedback ? "Posting..." : "Submit Feedback"}
                    </Button>
                  </form>
                </div>

                {/* Feedback List */}
                <div className="mt-6 w-full">
                  <h2 className="text-xl font-bold mb-4">Feedbacks</h2>
                  {isLoadingFeedbacks ? (
                    <p>Loading feedbacks...</p>
                  ) : feedbacks.length === 0 ? (
                    <p>No feedbacks yet.</p>
                  ) : (
                    feedbacks.map((feedback: any) => (
                      <div
                        key={feedback.id}
                        className="bg-white p-4 rounded-lg flex shadow-md mb-4"
                      >
                        <div className="flex w-full items-center space-x-4">
                          <div className="pr-7">
                            <div className="flex items-start gap-4">
                              <Link
                                href={`/d/${project.title}/p/${feedback.slug}`}
                              >
                                <h3 className="font-bold hover:underline ">
                                  {feedback.title}
                                </h3>
                              </Link>{" "}
                              <p className="text-green-500 text-sm font-medium">
                                {feedback.status}
                              </p>
                            </div>
                            <p className="text-gray-600 text-balance">
                              {feedback.description}
                            </p>
                            {/* number of comments */}
                            <span className="mt-6">
                              💬 {feedback.commentCount}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() =>
                              handleVote(feedback.id, feedback.votes)
                            }
                            className={`px-3 py-1 rounded-lg ${
                              feedback.voters.includes(user?.uid)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                            }`}
                            disabled={votingLoading[feedback.id]}
                          >
                            {votingLoading[feedback.id]
                              ? "..."
                              : `▲ ${feedback.votes}`}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">
                Loading project details...
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
