import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragEndEvent } from "@dnd-kit/core";
import { formatDate, getCurrentDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckSquare, TrendingUp } from "lucide-react";
import MeetingsPanel from "@/components/daily-planner/MeetingsPanel";
import DailyTimeline from "@/components/daily-planner/DailyTimeline";
import TodoPanel from "@/components/daily-planner/TodoPanel";
import type { Meeting, Todo, ScheduledItem } from "@shared/schema";

export default function DailyPlanner() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch meetings for selected date
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ["/api/meetings", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/meetings/${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch meetings");
      return response.json() as Promise<Meeting[]>;
    },
  });

  // Fetch todos
  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch todos");  
      return response.json() as Promise<Todo[]>;
    },
  });

  // Fetch scheduled items for selected date
  const { data: scheduledItems = [], isLoading: scheduledLoading } = useQuery({
    queryKey: ["/api/scheduled-items", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/scheduled-items/${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch scheduled items");
      return response.json() as Promise<ScheduledItem[]>;
    },
  });

  // Mutation to create scheduled item
  const createScheduledItemMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      startTime: string;
      duration: number;
      date: string;
      type: "meeting" | "todo" | "custom";
      originalId?: number;
      color?: string;
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule item",
        variant: "destructive",
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
    const meeting = meetings.find(m => `meeting-${m.id}` === draggedId);
    const todo = todos.find(t => `todo-${t.id}` === draggedId);

    if (meeting) {
      createScheduledItemMutation.mutate({
        title: meeting.title,
        startTime,
        duration: meeting.duration,
        date: selectedDate,
        type: "meeting",
        originalId: meeting.id,
        color: meeting.color || "#3B82F6",
      });
    } else if (todo) {
      createScheduledItemMutation.mutate({
        title: todo.title,
        startTime,
        duration: todo.estimatedDuration || 30,
        date: selectedDate,
        type: "todo",
        originalId: todo.id,
        color: "#7C3AED",
      });
    }
  };

  const isLoading = meetingsLoading || todosLoading || scheduledLoading;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalMeetings = meetings.length;
  const totalTodos = todos.filter(t => !t.completed).length;
  const scheduledTime = scheduledItems.reduce((acc, item) => acc + item.duration, 0) / 60;
  const completedTodos = todos.filter(t => t.completed).length;
  const totalTodoCount = todos.length;
  const completionPercentage = totalTodoCount > 0 ? Math.round((completedTodos / totalTodoCount) * 100) : 0;

  return (
    <div className="animate-slide-in">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Today's Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {formatDate(selectedDate)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 glass border border-white/20 dark:border-gray-700/30 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Three Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8" style={{ height: 'calc(100vh - 280px)' }}>
        <MeetingsPanel meetings={meetings} />
        <DailyTimeline 
          scheduledItems={scheduledItems}
          onDragEnd={handleDragEnd}
          onUpdateItem={(id, data) => updateScheduledItemMutation.mutate({ id, data })}
        />
        <TodoPanel todos={todos} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        <Card className="glass-panel p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-emerald rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMeetings}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Meetings Today</p>
            </div>
          </div>
        </Card>

        <Card className="glass-panel p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTodos}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Pending</p>
            </div>
          </div>
        </Card>

        <Card className="glass-panel p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-amber rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{scheduledTime.toFixed(1)}h</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Time</p>
            </div>
          </div>
        </Card>

        <Card className="glass-panel p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-red rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionPercentage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Complete</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
