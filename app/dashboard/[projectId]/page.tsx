"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  deleteDoc,
  updateDoc,
  collection,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clipboard, ExternalLink, Trash } from "lucide-react";
import withAuth from "@/lib/authGuard";
import { Button } from "@/components/ui/button";

export interface Feedback {
  id: string;
  status: "new" | "inProgress" | "resolved";
  message: string;
}

interface Project {
  id: string;
  title: string;
}

const ProjectFeedbackPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

  const [isDeletingFeedback, setIsDeletingFeedback] = useState("");
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [domainName, setDomainName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomainName(window.location.hostname);
    }
  }, []);

  const publicLink = `https://${domainName}/d/${project?.title}`;
  useEffect(() => {
    const fetchProject = async () => {
      const projectId = (await params).projectId;
      setIsLoadingFeedbacks(true);
      try {
        if (projectId) {
          const docRef = doc(db, "projects", projectId as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProject({ id: docSnap.id, title: docSnap.data().name });
            const feedbackRef = collection(
              db,
              "projects",
              docSnap.id,
              "feedbacks"
            );
            const unsub = onSnapshot(feedbackRef, (querySnapshot) => {
              const feedbackList = querySnapshot.docs.map(
                (doc) =>
                  ({
                    id: doc.id,
                    ...doc.data(),
                  } as Feedback)
              );
              setFeedbacks(feedbackList);
            });
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

  const handleDeleteProject = async () => {
    setIsDeletingProject(true);
    try {
      if (project?.id) {
        await deleteDoc(doc(db, "projects", project.id));
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    setIsDeletingFeedback(feedbackId);
    try {
      await deleteDoc(
        doc(db, "projects", project?.id!, "feedbacks", feedbackId)
      );
      setFeedbacks(feedbacks.filter((fb) => fb.id !== feedbackId));
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeletingFeedback("");
    }
  };

  const handleUpdateFeedbackStatus = async (
    feedbackId: string,
    newStatus: Feedback["status"]
  ) => {
    try {
      const feedbackRef = doc(
        db,
        "projects",
        project?.id!,
        "feedbacks",
        feedbackId
      );
      await updateDoc(feedbackRef, { status: newStatus });
      setFeedbacks(
        feedbacks.map((fb) =>
          fb.id === feedbackId ? { ...fb, status: newStatus } : fb
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Back Button */}
      <header className=" w-full bg-white ">
        <div className="flex px-6 md:p-4 justify-between max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-700 font-semibold bg-gray-200 px-4 py-2 rounded-lg"
          >
            ⬅️ Back
          </button>
          <div></div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row items-start gap-10 rounded-lg ">
        <div className="md:w-5/12 w-full p-6">
          <h2 className="text-xl font-bold">
            {project.title} — {feedbacks.length} Posts
          </h2>

          <div className="mt-4">
            <label className="text-sm font-semibold">Public link</label>
            <div className="flex items-center mt-1 bg-gray-100 p-2 rounded-md">
              <input
                className="flex-1 bg-transparent text-blue-600"
                type="text"
                value={publicLink}
                readOnly
              />
              <button
                className="ml-2 p-1"
                onClick={() => navigator.clipboard.writeText(publicLink)}
              >
                <Clipboard size={18} />
              </button>
              <a
                href={publicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 p-1"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          <button
            onClick={handleDeleteProject}
            className="mt-4 flex items-center text-red-500 hover:text-red-700"
          >
            {isDeletingProject ? (
              "Loading"
            ) : (
              <>
                <Trash size={18} />
                <span className="ml-1">Delete</span>
              </>
            )}
          </button>
          <div className="w-full bg-black text-center p-6 mt-10 rounded-md">
            <p className="text-white font-bold ">Upgrade to premium to use visual feedback</p>
            <Button className="mt-4 p-2 bg-white font-semibold uppercase hover:bg-white text-black rounded-lg" >
             upgrade now ⚡
            </Button>
          </div>
        </div>

        <div className="w-full flex flex-col">
          {isLoadingFeedbacks ? (
            <div className="text-center">
              <p>Loading feedbacks...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center">
              <p>No feedbacks yet.</p>
            </div>
          ) : (
            feedbacks.map((item: any) => (
              <div
                key={item.id}
                className="mt-6 p-4 bg-gray-50 rounded-lg w-full flex items-start shadow-sm"
              >
                <div className="w-full px-5">
                  <h3 className="font-semibold text-balance ">{item.title}</h3>
                  <p className="text-sm text-gray-600 text-balance">
                    {item.description}
                  </p>
                  <div className="flex items-center mt-4 text-gray-500 text-sm">
                    <span>▲ {item.votes}</span>
                    <span className="ml-4">💬 0</span>
                  </div>
                </div>
                <div className="w-5/12 space-y-4">
                  {/* <Select
                    onValueChange={(value) =>
                      handleUpdateFeedbackStatus(
                        item.id,
                        value as Feedback["status"]
                      )
                    }
                    value={item.status}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="⭐ New" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">⭐ New</SelectItem>
                      <SelectItem value="Work In Progress">
                        ⏳ Work In Progress
                      </SelectItem>
                      <SelectItem value="Shipped">✅ Shipped</SelectItem>
                      <SelectItem value="Cancled">❌ Cancled</SelectItem>
                    </SelectContent>
                  </Select> */}

                  <button
                    onClick={() => router.push(`/d/${project.title}/p/${item.slug}`)}
                    className=" w-full bg-gray-100 py-2 text-blue-500 hover:underline"
                  >
                    View →
                  </button>
                  <button
                    onClick={() => handleDeleteFeedback(item.id)}
                    className=" flex w-full justify-center py-2 bg-red-100 items-center text-red-500 hover:text-red-700"
                  >
                    {isDeletingFeedback ? (
                      "Loading"
                    ) : (
                      <>
                        <Trash size={18} />
                        <span className="ml-1">Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(ProjectFeedbackPage);
