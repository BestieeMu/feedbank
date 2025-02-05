import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";


interface KanbanCardProps {
  feedback: any;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ feedback }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: feedback.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Card className="cursor-pointer">
        <CardContent className="p-4">
          <h3 className="font-semibold text-xl">{feedback.title}</h3>
          <p className="text-sm mt-2 text-gray-400">{feedback.description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanCard;
