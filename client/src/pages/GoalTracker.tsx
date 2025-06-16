import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Edit, Trash2, CheckCircle, X, Minus, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Goal, HabitTracking, HabitLegend } from "@shared/schema";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  targetValue: z.number().min(1).optional(),
  unit: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  targetDate: z.string().optional(),
});

const legendSchema = z.object({
  iconKey: z.string().min(1, "Icon key is required"),
  label: z.string().min(1, "Label is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

type GoalForm = z.infer<typeof goalSchema>;
type LegendForm = z.infer<typeof legendSchema>;

const iconOptions = [
  { value: "CheckCircle", label: "Check Circle", icon: CheckCircle },
  { value: "X", label: "X", icon: X },
  { value: "Minus", label: "Minus", icon: Minus },
  { value: "Circle", label: "Circle", icon: Circle },
  { value: "Target", label: "Target", icon: Target },
];

export default function GoalTracker() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [legendDialogOpen, setLegendDialogOpen] = useState(false);
  const [editingLegend, setEditingLegend] = useState<HabitLegend | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json() as Promise<Goal[]>;
    },
  });

  const { data: habitTracking = [], isLoading: trackingLoading } = useQuery({
    queryKey: ["/api/habit-tracking", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/habit-tracking/${selectedMonth}/${selectedYear}`);
      if (!response.ok) throw new Error("Failed to fetch habit tracking");
      return response.json() as Promise<HabitTracking[]>;
    },
  });

  const { data: habitLegends = [], isLoading: legendsLoading } = useQuery({
    queryKey: ["/api/habit-legends"],
    queryFn: async () => {
      const response = await fetch("/api/habit-legends");
      if (!response.ok) throw new Error("Failed to fetch habit legends");
      return response.json() as Promise<HabitLegend[]>;
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalForm) => {
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setGoalDialogOpen(false);
      goalForm.reset();
      toast({ title: "Success", description: "Goal created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create goal", variant: "destructive" });
    },
  });

  const createHabitTrackingMutation = useMutation({
    mutationFn: async (data: { habitId: number; date: string; status: string; iconKey: string }) => {
      const response = await apiRequest("POST", "/api/habit-tracking", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-tracking", selectedMonth, selectedYear] });
    },
  });

  const createLegendMutation = useMutation({
    mutationFn: async (data: LegendForm) => {
      const response = await apiRequest("POST", "/api/habit-legends", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-legends"] });
      setLegendDialogOpen(false);
      setEditingLegend(null);
      legendForm.reset();
      toast({ title: "Success", description: "Legend item saved!" });
    },
  });

  const goalForm = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const legendForm = useForm<LegendForm>({
    resolver: zodResolver(legendSchema),
    defaultValues: {
      iconKey: "",
      label: "",
      icon: "CheckCircle",
      color: "#10B981",
    },
  });

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getTrackingForGoalAndDate = (goalId: number, date: string) => {
    return habitTracking.find(t => t.habitId === goalId && t.date === date);
  };

  const handleCellClick = (goal: Goal, day: number) => {
    const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const existing = getTrackingForGoalAndDate(goal.id, date);
    
    if (existing) {
      // Cycle through legend items
      const currentIndex = habitLegends.findIndex(l => l.iconKey === existing.iconKey);
      const nextIndex = (currentIndex + 1) % habitLegends.length;
      const nextLegend = habitLegends[nextIndex];
      
      if (nextLegend) {
        createHabitTrackingMutation.mutate({
          habitId: goal.id,
          date,
          status: nextLegend.iconKey,
          iconKey: nextLegend.iconKey,
        });
      }
    } else {
      // Create new with first legend item
      const firstLegend = habitLegends[0];
      if (firstLegend) {
        createHabitTrackingMutation.mutate({
          habitId: goal.id,
          date,
          status: firstLegend.iconKey,
          iconKey: firstLegend.iconKey,
        });
      }
    }
  };

  const getLegendByKey = (iconKey: string) => {
    return habitLegends.find(l => l.iconKey === iconKey);
  };

  const renderIcon = (iconName: string, className?: string) => {
    const IconComponent = iconOptions.find(opt => opt.value === iconName)?.icon || Circle;
    return <IconComponent className={className} />;
  };

  const onSubmitGoal = (data: GoalForm) => {
    createGoalMutation.mutate(data);
  };

  const onSubmitLegend = (data: LegendForm) => {
    createLegendMutation.mutate(data);
  };

  const handleAddLegend = () => {
    setEditingLegend(null);
    legendForm.reset();
    setLegendDialogOpen(true);
  };

  if (goalsLoading || trackingLoading || legendsLoading) {
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

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Goal & Habit Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your goals and habits with customizable status indicators
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="glass">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <Form {...goalForm}>
                <form onSubmit={goalForm.handleSubmit(onSubmitGoal)} className="space-y-4">
                  <FormField
                    control={goalForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Daily Exercise" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={goalForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Goal description (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={goalForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Health, Learning, Work" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={goalForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={goalForm.control}
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-white">
                    Create Goal
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Month/Year Selector */}
      <Card className="glass-panel mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">
              {monthName} {selectedYear}
            </h3>
            <div className="flex items-center space-x-4">
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(Number(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Tracking Grid */}
      {goals.length === 0 ? (
        <Card className="glass-panel">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
              No goals created yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Create your first goal to start tracking your progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {goals.filter(goal => goal.isActive).map((goal) => (
            <Card key={goal.id} className="glass-panel">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span>{goal.title}</span>
                    </CardTitle>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {goal.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {/* Day headers */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const tracking = getTrackingForGoalAndDate(goal.id, date);
                    const legend = tracking ? getLegendByKey(tracking.iconKey) : null;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleCellClick(goal, day)}
                        className={cn(
                          "aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary transition-all flex items-center justify-center",
                          tracking && "border-solid bg-white dark:bg-slate-800 shadow-sm"
                        )}
                        style={{
                          borderColor: legend?.color || undefined,
                          backgroundColor: legend ? `${legend.color}20` : undefined,
                        }}
                      >
                        {legend && (
                          <div style={{ color: legend.color }}>
                            {renderIcon(legend.icon, "w-4 h-4")}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Legend */}
      <Card className="glass-panel mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Circle className="w-5 h-5 text-primary" />
              <span>Status Legend</span>
            </CardTitle>
            <Dialog open={legendDialogOpen} onOpenChange={setLegendDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleAddLegend}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Status Legend</DialogTitle>
                </DialogHeader>
                <Form {...legendForm}>
                  <form onSubmit={legendForm.handleSubmit(onSubmitLegend)} className="space-y-4">
                    <FormField
                      control={legendForm.control}
                      name="iconKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Key</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., completed, partial" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={legendForm.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Completed, Partial" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={legendForm.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {iconOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center space-x-2">
                                    <option.icon className="w-4 h-4" />
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={legendForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full gradient-primary text-white">
                      Add Status
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {habitLegends.map((legend) => (
              <div
                key={legend.id}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div style={{ color: legend.color }}>
                  {renderIcon(legend.icon, "w-5 h-5")}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {legend.label}
                </span>
              </div>
            ))}
          </div>
          {habitLegends.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No status options defined</p>
              <p className="text-xs mt-1">Add status options to start tracking</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
