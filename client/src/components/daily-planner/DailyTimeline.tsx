import { DragEndEvent } from "@dnd-kit/core";
import { Clock, Undo2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTimeSlots, formatTime } from "@/lib/utils";
import TimeSlot from "./TimeSlot";
import ScheduledItem from "./ScheduledItem";
import type { ScheduledItem as ScheduledItemType } from "@shared/schema";

interface DailyTimelineProps {
  scheduledItems: ScheduledItemType[];
  onDragEnd: (event: DragEndEvent) => void;
  onUpdateItem: (id: number, data: Partial<ScheduledItemType>) => void;
}

export default function DailyTimeline({ 
  scheduledItems, 
  onDragEnd, 
  onUpdateItem 
}: DailyTimelineProps) {
  const timeSlots = getTimeSlots();

  const getItemsForTimeSlot = (time: string) => {
    return scheduledItems.filter(item => item.startTime === time);
  };

  return (
    <div className="lg:col-span-2">
      <Card className="glass-panel h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            <span>Daily Timeline</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-xs">
              <Undo2 className="w-3 h-3 mr-1" />
              Undo
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              <Save className="w-3 h-3 mr-1" />
              Auto-save
              <span className="ml-1 animate-pulse-gentle">•</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full pr-4">
            <div className="px-6 pb-6">
              <div className="space-y-0">
                {timeSlots.map((time) => {
                  const items = getItemsForTimeSlot(time);
                  return (
                    <TimeSlot 
                      key={time} 
                      time={time}
                      onDragEnd={onDragEnd}
                    >
                      {items.map((item) => (
                        <ScheduledItem
                          key={item.id}
                          item={item}
                          onUpdate={(data) => onUpdateItem(item.id, data)}
                        />
                      ))}
                    </TimeSlot>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
