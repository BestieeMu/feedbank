import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";

const statuses: string[] = ["New", "Work In Progress", "Shipped", "Canceled"];

const KanbanBoard: React.FC<{ feedbacks: any; onUpdateStatus: (id: string, status: string) => void }> = ({ feedbacks, onUpdateStatus }) => {
  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    console.log("Dropped");

    const itemToMove = feedbacks.find((item: any) => item.id === active.id);
    if (!itemToMove) return;

    const newStatus = over.id;

    // Update Firestore first
    onUpdateStatus(itemToMove.id, newStatus);
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid w-full grid-cols-4 gap-4 py-4">
        {statuses.map((status) => (
          <SortableContext key={status} items={feedbacks.filter((item: any) => item.status.toLowerCase() === status.toLowerCase()).map((item: any) => item.id)}>
            <KanbanColumn
              title={status}
              status={status}
              feedbacks={feedbacks.filter((item: any) => item.status.toLowerCase() === status.toLowerCase())}
            />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
