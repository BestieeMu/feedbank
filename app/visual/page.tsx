"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // Adjust based on your setup
import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import KanbanBoard from "@/components/KanbanBoard";
import {
  Bar,
  BarChart,
  XAxis,
  Label,
  Pie,
  PieChart,
  CartesianGrid,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout, signInWithGoogle } from "@/service/aujth.service";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import withAuth from "@/lib/authGuard";

interface Project {
  id: string;
  name: string;
}

interface Feedback {
  id: string;
  votes: number;
  title: string;
  status: string;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [dropDown, setDropDown] = useState(false);
  const router = useRouter();
  useEffect(() => {
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
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Project)
      );
      setProjects(projectList);
      // set default project
      if (projectList.length > 0) {
        setSelectedProject(projectList[0].id);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    const docRef = doc(db, "projects", selectedProject);
    const feedbackRef = collection(docRef, "feedbacks");

    const unsub = onSnapshot(feedbackRef, (snapshot) => {
      setFeedbacks(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Feedback))
      );
      setLoading(false);
    });

    return () => unsub();
  }, [selectedProject]);

  const handleUpdateStatus = async (id: string, status: string) => {
    const feedbackRef = doc(db, "projects", selectedProject!, "feedbacks", id);
    await updateDoc(feedbackRef, { status });

    // Force UI refresh by updating feedbacks state
    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, status } : fb))
    );
  };

  const topFeedbacks = [...feedbacks]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  const selectedProjectName = projects.find(
    (project) => project.id === selectedProject
  )?.name;

  const statuses = ["New", "Work In Progress", "Shipped", "Canceled"];

  const chartData = statuses.map((status) => ({
    status,
    count: feedbacks.filter((feedback) => feedback.status === status).length,
  }));

  const chartConfig = {
    count: {
      label: "Count",
    },
    status: {
      label: "Status",
    },
  } satisfies ChartConfig;

  const topChartData = feedbacks.map((feedback, index) => ({
    title: feedback.title.toLowerCase(),
    votes: feedback.votes,
    fill: `hsl(var(--chart-${index + 1}))`, // You can replace this with dynamic colors if needed
  }));

  const topChartConfig = {
    votes: { label: "Votes" },
    ...Object.fromEntries(
      feedbacks.map((feedback, index) => [
        feedback.title.toLowerCase(),
        {
          label: feedback.title.toLowerCase(),
          color: `hsl(var(--chart-${index + 1}))`,
        },
      ])
    ),
  } satisfies ChartConfig;

  return (
   <>

        <header className=" w-full bg-white ">
        <div className="flex justify-between px-6 md:p-4 max-w-7xl mx-auto">
          <DropdownMenu>
            <DropdownMenuTrigger>
              {user && (
                <div
                  onClick={() => setDropDown(!dropDown)}
                  className="relative justify-center items-center bg-gray-200 py-3 flex gap-4 rounded-md px-3"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.photoURL}
                      className="w-6 h-6 rounded-full"
                      alt="Profile"
                    />
                    <span className="font-semibold text-sm">
                      {user.displayName.split(" ")[0]}
                    </span>
                  </div>

                  <ChevronDown />
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => logout(router)}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div>
           
          </div>
        </div>
      </header>
    <div className="p-6 gap-10 space-y-6 flex">
      {/* Project Selector */}
      <div className="w-2/12 mt-6">
        <Select
          onValueChange={setSelectedProject}
          value={selectedProject || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 bg-white min-h-52 border border-black rounded-xl p-6 animate-fade-in">
            <h2 className="text-4xl md:text-5xl text-black">
              Welcome to <br />
              <strong>{selectedProjectName}</strong>
            </h2>
          </div>

          <div className="flex-1 bg-white border min-h-52 border-black rounded-xl p-6 animate-fade-in">
            <h2 className="text-4xl md:text-5xl text-black">
              Total Feedback <br />
              <strong>{feedbacks.length}</strong>
            </h2>
          </div>
        </div>

        <div className="flex gap-10 mt-10">
          <div className="min-h-[200px] w-full">
            <h2 className="text-xl font-bold mb-4">Feedback Status Distribution</h2>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value}
                />
                <Bar dataKey="count" fill="var(--color-desktop)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="w-full">
            <h2 className="text-xl font-bold mb-4">Top 5 Feedbacks by Votes</h2>
            <p className="text-lg mb-6">Explore the most popular feedbacks based on votes.</p>
            <ChartContainer
              config={topChartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={topChartData}
                  dataKey="votes"
                  nameKey="title"
                  innerRadius={60}
                  strokeWidth={5}
                  fill="#8884d8"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {topFeedbacks
                                .reduce(
                                  (acc: any, curr: any) => acc + curr.votes,
                                  0
                                )
                                .toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total Votes
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="w-full mt-10">
          <h1 className="font-bold text-2xl">FeedBack Task</h1>
          {feedbacks && (
            <KanbanBoard
              feedbacks={feedbacks}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </div>
      </div>
    </div>
   </>
  );
};

export default withAuth(Dashboard);
