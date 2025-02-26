import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface KanbanCardProps {
  feedback: any;
  projectId: string;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ feedback, projectId }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: feedback.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const handleDeleteFeedback = async (feedbackId: string) => {
    console.log("clicked")
    try {
      const res = await deleteDoc(
        doc(db, "projects", projectId, "feedbacks", feedbackId)
      );
      console.log("clicked")
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Card className="cursor-pointer">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            {" "}
            <h3 className="font-semibold text-xl">{feedback.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger>
                {" "}
                <EllipsisVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-20">
                <DropdownMenuItem
                  onClick={() => handleDeleteFeedback(feedback.id)}
                >
                  {"Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm mt-2 text-gray-400">{feedback.description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanCard;
