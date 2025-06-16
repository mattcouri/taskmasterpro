import { useDroppable } from "@dnd-kit/core";
import { DragEndEvent } from "@dnd-kit/core";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  time: string;
  children?: React.ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
}

export default function TimeSlot({ time, children, onDragEnd }: TimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `time-${time}`,
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "time-slot flex min-h-[60px] border-b border-border/20",
        isOver && "drop-zone drag-over"
      )}
    >
      <div className="w-16 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 pt-2">
        {formatTime(time)}
      </div>
      <div className="flex-1 relative">
        {children}
      </div>
    </div>
  );
}
