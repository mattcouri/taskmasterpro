import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DraggableItemProps {
  id: string;
  data?: any;
  children: React.ReactNode;
  className?: string;
}

export default function DraggableItem({ 
  id, 
  data, 
  children, 
  className 
}: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "draggable touch-none",
        isDragging && "opacity-50 scale-105 z-50",
        className
      )}
    >
      {children}
    </div>
  );
}
