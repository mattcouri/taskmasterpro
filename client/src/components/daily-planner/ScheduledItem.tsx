import { useState } from "react";
import { GripVertical, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateItemHeight, addMinutesToTime, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ScheduledItem } from "@shared/schema";

interface ScheduledItemProps {
  item: ScheduledItem;
  onUpdate: (data: Partial<ScheduledItem>) => void;
}

export default function ScheduledItem({ item, onUpdate }: ScheduledItemProps) {
  const [isResizing, setIsResizing] = useState(false);
  const height = calculateItemHeight(item.duration);
  const endTime = addMinutesToTime(item.startTime, item.duration);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startDuration = item.duration;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newDuration = Math.max(15, startDuration + Math.round(deltaY / 2));
      onUpdate({ duration: newDuration });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={cn(
        "absolute inset-x-0 top-0 rounded-lg p-3 shadow-sm border-l-4 cursor-move transition-all",
        "scheduled-item group hover:shadow-md",
        isResizing && "shadow-lg scale-[1.02]"
      )}
      style={{
        height: `${height}px`,
        backgroundColor: item.color || "#6B7280",
        borderLeftColor: item.color || "#6B7280",
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-white font-medium text-sm leading-tight">
          {item.title}
        </h4>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-white/70" />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-white/80 text-xs">
        <Clock className="w-3 h-3" />
        <span>{item.duration} min</span>
        <span>•</span>
        <span>{formatTime(item.startTime)} - {formatTime(endTime)}</span>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-white/20 cursor-ns-resize rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-2 h-0.5 bg-white/60 rounded"></div>
        <div className="absolute bottom-0.5 right-1 w-2 h-0.5 bg-white/60 rounded"></div>
      </div>
    </div>
  );
}
