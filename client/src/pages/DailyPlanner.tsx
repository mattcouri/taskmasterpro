import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DragDropProvider } from "@/components/DragDropProvider";
import MeetingsPanel from "@/components/daily-planner/MeetingsPanel";
import DailyTimeline from "@/components/daily-planner/DailyTimeline";
import TodoPanel from "@/components/daily-planner/TodoPanel";
import type { Meeting, Todo, ScheduledItem } from "@shared/schema";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DailyPlanner() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // Fetch meetings for selected date
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ["/api/meetings", selectedDate],
  });

  // Fetch todos
  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ["/api/todos"],
  });

  // Fetch scheduled items for selected date
  const { data: scheduledItems = [], isLoading: scheduledLoading } = useQuery({
    queryKey: ["/api/scheduled-items", selectedDate],
  });

  // Mutation to create scheduled item
  const createScheduledItemMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      startTime: string;
      duration: number;
      date: string;
      type: string;
      originalId?: number;
    }) => {
      const response = await apiRequest("POST", "/api/scheduled-items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-items", selectedDate] });
      toast({
        title: "Success",
        description: "Item scheduled successfully!",
      });
    },
  });

  // Mutation to update scheduled item
  const updateScheduledItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ScheduledItem> }) => {
      const response = await apiRequest("PUT", `/api/scheduled-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-items", selectedDate] });
      toast({
        title: "Success", 
        description: "Schedule updated!",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const draggedId = active.id as string;
    const dropZoneId = over.id as string;

    // Parse the drop zone ID to get time slot
    const timeMatch = dropZoneId.match(/time-(\d{2}:\d{2})/);
    if (!timeMatch) return;

    const startTime = timeMatch[1];

    // Check if dragging from meetings or todos
    const meeting = meetings.find((m: Meeting) => `meeting-${m.id}` === draggedId);
    const todo = todos.find((t: Todo) => `todo-${t.id}` === draggedId);

    if (meeting) {
      createScheduledItemMutation.mutate({
        title: meeting.title,
        startTime,
        duration: meeting.duration,
        date: selectedDate,
        type: "meeting",
        originalId: meeting.id,
      });
    } else if (todo) {
      createScheduledItemMutation.mutate({
        title: todo.title,
        startTime,
        duration: todo.estimatedDuration || 60,
        date: selectedDate,
        type: "todo",
        originalId: todo.id,
      });
    }

    setDraggedItem(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeItem = [...meetings, ...todos, ...scheduledItems].find(
      item => `${item.id}` === event.active.id || `meeting-${item.id}` === event.active.id || `todo-${item.id}` === event.active.id
    );
    setDraggedItem(activeItem);
  };

  if (meetingsLoading || todosLoading || scheduledLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            Daily Schedule
          </h1>
          <p className="text-gray-600">
            Drag items here and organize your day
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-pink-100">
          <Calendar className="h-4 w-4 text-pink-500" />
          <span className="text-sm font-medium text-gray-700">
            {formatDate(selectedDate)}
          </span>
        </div>
      </div>

      <DragDropProvider 
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Calendar Events Panel */}
          <div className="lg:col-span-3">
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-pink-100 shadow-lg shadow-pink-500/10">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-gray-800">Calendar Events</h3>
              </div>
              <MeetingsPanel meetings={meetings} />
            </Card>
          </div>

          {/* Daily Timeline */}
          <div className="lg:col-span-6">
            <DailyTimeline 
              scheduledItems={scheduledItems}
              selectedDate={selectedDate}
              draggedItem={draggedItem}
              onUpdateItem={(id, data) => updateScheduledItemMutation.mutate({ id, data })}
            />
          </div>

          {/* Todo Items Panel */}
          <div className="lg:col-span-3">
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-orange-100 shadow-lg shadow-orange-500/10">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-gray-800">Todo Items</h3>
                <div className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                  {todos.filter((todo: Todo) => !todo.completed).length} pending
                </div>
              </div>
              <TodoPanel todos={todos} />
            </Card>
          </div>
        </div>
      </DragDropProvider>
    </div>
  );
}