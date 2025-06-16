import { CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import DraggableItem from "./DraggableItem";
import type { Meeting } from "@shared/schema";

interface MeetingsPanelProps {
  meetings: Meeting[];
  isLoading?: boolean;
}

export default function MeetingsPanel({ meetings }: MeetingsPanelProps) {
  return (
    <div className="lg:col-span-1">
      <Card className="glass-panel h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <CalendarPlus className="w-5 h-5 text-primary" />
            <span>Today's Meetings</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <CalendarPlus className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {meetings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No meetings scheduled</p>
              </div>
            ) : (
              meetings.map((meeting) => (
                <DraggableItem
                  key={meeting.id}
                  id={`meeting-${meeting.id}`}
                  data={meeting}
                  className="meeting-item"
                >
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-grab">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {meeting.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(meeting.startTime)} - {formatTime(
                            new Date(
                              new Date(`2000-01-01T${meeting.startTime}`).getTime() + 
                              meeting.duration * 60000
                            ).toTimeString().slice(0, 5)
                          )}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {meeting.duration} min
                        </p>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: meeting.color || "#3B82F6" }}
                      />
                    </div>
                  </div>
                </DraggableItem>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
