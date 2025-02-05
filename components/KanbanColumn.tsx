import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
  title: string;
  status: string;
  feedbacks: any;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, feedbacks }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={cn("w-full pb-2  rounded-md ", isOver && "bg-gray-200 dark:bg-gray-700")}>
     <div className="mb-4 py-4 px-3 rounded-md bg-black">
     <h3 className=" text-lg font-bold text-white">{title}</h3>
     </div>
      <div className="space-y-4">
        {feedbacks.map((feedback: any) => (
          <KanbanCard key={feedback.id} feedback={feedback} />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
