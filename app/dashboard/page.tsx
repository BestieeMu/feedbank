"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { logout, signInWithGoogle } from "@/service/aujth.service";
import { Button } from "@/components/ui/button";
import withAuth from "@/lib/authGuard";

const Dashboard = () => {
  const [boardName, setBoardName] = useState("");
  const [boards, setBoards] = useState<any>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false); // State for loading boards
  const [isCreatingBoard, setIsCreatingBoard] = useState(false); // State for creating a board
  const [dropDown, setDropDown] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
        fetchBoards(currentUser);
      } else {
        setUser(null);
        setBoards([]); // Clear boards when user logs out
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBoards = async (currentUser: any) => {
    setIsLoadingBoards(true); // Set loading to true when fetching boards
    if (currentUser) {
      const q = query(
        collection(db, "projects"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedBoards = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBoards(fetchedBoards);
    }
    setIsLoadingBoards(false); // Set loading to false after fetching boards
  };

  const createBoard = async () => {
    setIsCreatingBoard(true); // Set creating to true when creating a board
    if (!boardName.trim() || !user) {
      setIsCreatingBoard(false); // Set creating to false if board name is empty or user is not logged in
      return;
    }

    await addDoc(collection(db, "projects"), {
      name: boardName,
      userId: user?.uid,
      createdAt: new Date(),
    });

    setBoardName("");
    fetchBoards(user);
    setIsCreatingBoard(false); // Set creating to false after creating a board
  };

  return (
    <>
      {" "}
      <div className="">
        <div className="bg-black">
          <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between lg:flex-row lg:justify-center">
              <div className="flex flex-1 items-center lg:mr-3 lg:flex-none">
                <p className="ml-3 text-center font-medium text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="mr-2 hidden h-6 w-6 lg:inline"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    ></path>
                  </svg>
                  To fully utilize visualX for project data visualization and feedback management, subscribe now.
                </p>
              </div>
              <div className="mt-2 w-full flex-shrink-0 lg:mt-0 lg:w-auto">
                <a
                  className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-teal-600 shadow-sm hover:bg-teal-50"
                  href="#pricing"
                >
                  Buy now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <header className=" w-full bg-white ">
        <div className="flex justify-between px-6 md:p-4 max-w-5xl mx-auto">
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
            {!user && (
              <button
                onClick={() => signInWithGoogle(router)}
                className="bg-black text-white px-4 rounded-md py-3"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex flex-col md:flex-row max-w-5xl mx-auto gap-10">
          <div className="bg-white md:w-5/12 w-full p-6 rounded-xl shadow-md max-w-md">
            <h2 className="font-bold text-lg">
              Build features users{" "}
              <span className="bg-black text-white px-2 py-1 rounded">
                really
              </span>{" "}
              want
            </h2>
            <input
              type="text"
              placeholder="Board Name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="w-full p-2 mt-3 border rounded-lg"
            />
            <Button
              onClick={createBoard}
              className="w-full text-white py-2 mt-3 rounded-lg font-semibold"
              disabled={isCreatingBoard} // Disable button while creating a board
            >
              {isCreatingBoard ? "Creating..." : "Create Board"}
            </Button>
          </div>

          <div className="w-full">
            <h2 className="font-bold text-2xl ">{boards.length} Boards</h2>
            <div className="grid w-full grid-cols-2 gap-4 mt-3">
              {isLoadingBoards ? (
                <div>Loading...</div> // Display loading indicator for boards
              ) : (
                boards.map((board: any) => (
                  <Link
                    href={`/dashboard/${board.id}`}
                    key={board.id}
                    className="bg-white w-full px-10 py-7 hover:bg-black cursor-pointer hover:text-white rounded-xl shadow-md font-semibold"
                  >
                    <p className="font-semibold text-lg">{board.name}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Dashboard);
