"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from 'sonner';
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
  const [editingBoard, setEditingBoard] = useState(null); // State for editing a board
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

  const checkBoardExistence = async (boardName: string) => {
    const q = query(
      collection(db, "projects"),
      where("name", "==", boardName),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0;
  };

  const createBoard = async () => {
    setIsCreatingBoard(true); // Set creating to true when creating a board
    if (!boardName.trim() || !user) {
      setIsCreatingBoard(false); // Set creating to false if board name is empty or user is not logged in
      return;
    }

    const boardExists = await checkBoardExistence(boardName);
    if (boardExists) {
      toast.success('A board with this name already exists.')
      setIsCreatingBoard(false); // Set creating to false if board already exists
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

  const editBoard = async (boardId: string, newName: string) => {
    if (!newName.trim() || !user) {
      return;
    }

    const boardExists = await checkBoardExistence(newName);
    if (boardExists) {
      toast.success('A board with this name already exists.')
      return;
    }

    const boardRef = doc(db, "projects", boardId);
    await updateDoc(boardRef, { name: newName });

    setBoardName("");
    fetchBoards(user);
    setEditingBoard(null); // Set editing to false after editing a board
  };

  return (
    <>
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
            <Link href={"/d/FeedBank"}>💡Feedback</Link>
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex flex-col md:items-start md:flex-row max-w-5xl mx-auto gap-10">
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
                  <div key={board.id} className="bg-white w-full px-10 py-7 hover:bg-black group cursor-pointer hover:text-white rounded-xl shadow-md font-semibold">
                    <p className="font-semibold text-lg">{board.name}</p>
                    {editingBoard === board.id && (
                      <input
                        type="text"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        className="w-full p-2 mt-1 border text-black rounded-lg"
                      />
                    )}
                    <Button
                      onClick={() => editingBoard === board.id ? editBoard(board.id, boardName) : setEditingBoard(board.id)}
                      className="mt-2 group-hover:bg-white text-white group-hover:text-black py-2 rounded-lg font-semibold"
                      disabled={isCreatingBoard} // Disable button while creating a board
                    >
                      {editingBoard === board.id ? "Save" : "Edit"}
                    </Button>
                  </div>
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
