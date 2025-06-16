import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderPlus, CheckSquare, Folder, Star, Circle, Minus, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getColorForPriority } from "@/lib/utils";
import type { Todo, Project } from "@shared/schema";

const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  estimatedDuration: z.number().min(5).max(480),
  projectId: z.number().optional(),
  dueDate: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().default("#7C3AED"),
});

type TodoForm = z.infer<typeof todoSchema>;
type ProjectForm = z.infer<typeof projectSchema>;

export default function TodoList() {
  const [selectedProject, setSelectedProject] = useState<number | "all">("all");
  const [todoDialogOpen, setTodoDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ["/api/todos"],
    queryFn: async () => {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch todos");
      return response.json() as Promise<Todo[]>;
    },
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json() as Promise<Project[]>;
    },
  });

  const createTodoMutation = useMutation({
    mutationFn: async (data: TodoForm) => {
      const response = await apiRequest("POST", "/api/todos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setTodoDialogOpen(false);
      toast({ title: "Success", description: "Todo created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create todo", variant: "destructive" });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectForm) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setProjectDialogOpen(false);
      toast({ title: "Success", description: "Project created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Todo> }) => {
      const response = await apiRequest("PUT", `/api/todos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({ title: "Success", description: "Todo updated!" });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/todos/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({ title: "Success", description: "Todo deleted!" });
    },
  });

  const todoForm = useForm<TodoForm>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      estimatedDuration: 30,
    },
  });

  const projectForm = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#7C3AED",
    },
  });

  const filteredTodos = selectedProject === "all" 
    ? todos 
    : todos.filter(todo => todo.projectId === selectedProject);

  const incompleteTodos = filteredTodos.filter(todo => !todo.completed);
  const completedTodos = filteredTodos.filter(todo => todo.completed);

  const todosByPriority = {
    high: incompleteTodos.filter(todo => todo.priority === "high"),
    medium: incompleteTodos.filter(todo => todo.priority === "medium"),
    low: incompleteTodos.filter(todo => todo.priority === "low"),
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Star className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Circle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <Minus className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleToggleComplete = (todo: Todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  };

  const onSubmitTodo = (data: TodoForm) => {
    createTodoMutation.mutate(data);
  };

  const onSubmitProject = (data: ProjectForm) => {
    createProjectMutation.mutate(data);
  };

  if (todosLoading || projectsLoading) {
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

  const PrioritySection = ({ 
    title, 
    icon, 
    todos, 
    priority 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    todos: Todo[]; 
    priority: string;
  }) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
        <Badge variant="secondary" className="ml-2">
          {todos.length}
        </Badge>
      </h4>
      <div className="space-y-2">
        {todos.map((todo) => {
          const project = projects.find(p => p.id === todo.projectId);
          return (
            <div key={todo.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all card-hover">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  checked={todo.completed}
                  onCheckedChange={() => handleToggleComplete(todo)}
                  className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {todo.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteTodoMutation.mutate(todo.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {todo.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {todo.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Est. {todo.estimatedDuration || 30} min
                    </span>
                    {project && (
                      <Badge variant="outline" className="text-xs">
                        <Folder className="w-3 h-3 mr-1" />
                        {project.name}
                      </Badge>
                    )}
                    {todo.dueDate && (
                      <Badge variant="outline" className="text-xs">
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                <div 
                  className="w-2 h-2 rounded-full mt-2"
                  style={{ backgroundColor: getColorForPriority(priority) }}
                />
              </div>
            </div>
          );
        })}
        {todos.length === 0 && (
          <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
            No {priority} priority tasks
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tasks & Projects
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your work with projects and priorities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="glass">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-4">
                  <FormField
                    control={projectForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Project description (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
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
                    Create Project
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={todoDialogOpen} onOpenChange={setTodoDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <Form {...todoForm}>
                <form onSubmit={todoForm.handleSubmit(onSubmitTodo)} className="space-y-4">
                  <FormField
                    control={todoForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={todoForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Task description (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={todoForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={todoForm.control}
                      name="estimatedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="5" 
                              max="480"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={todoForm.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={todoForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full gradient-primary text-white">
                    Create Task
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Projects */}
        <div className="lg:col-span-1">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-primary" />
                <span>Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={selectedProject === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedProject("all")}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  All Tasks
                  <Badge variant="secondary" className="ml-auto">
                    {todos.length}
                  </Badge>
                </Button>
                {projects.map((project) => {
                  const projectTodos = todos.filter(t => t.projectId === project.id);
                  return (
                    <Button
                      key={project.id}
                      variant={selectedProject === project.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                      <Badge variant="secondary" className="ml-auto">
                        {projectTodos.length}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Tasks */}
        <div className="lg:col-span-3">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>
                {selectedProject === "all" 
                  ? "All Tasks"
                  : projects.find(p => p.id === selectedProject)?.name || "Tasks"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incompleteTodos.length === 0 && completedTodos.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                  <p className="text-sm">Create your first task to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Incomplete Tasks by Priority */}
                  {incompleteTodos.length > 0 && (
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Active Tasks
                      </h3>
                      <PrioritySection
                        title="High Priority"
                        icon={<Star className="w-4 h-4 text-red-500" />}
                        todos={todosByPriority.high}
                        priority="high"
                      />
                      <PrioritySection
                        title="Medium Priority"
                        icon={<Circle className="w-4 h-4 text-yellow-500" />}
                        todos={todosByPriority.medium}
                        priority="medium"
                      />
                      <PrioritySection
                        title="Low Priority"
                        icon={<Minus className="w-4 h-4 text-green-500" />}
                        todos={todosByPriority.low}
                        priority="low"
                      />
                    </div>
                  )}

                  {/* Completed Tasks */}
                  {completedTodos.length > 0 && (
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Completed Tasks
                        <Badge variant="secondary" className="ml-2">
                          {completedTodos.length}
                        </Badge>
                      </h3>
                      <div className="space-y-2">
                        {completedTodos.map((todo) => {
                          const project = projects.find(p => p.id === todo.projectId);
                          return (
                            <div key={todo.id} className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700 opacity-75">
                              <div className="flex items-start space-x-3">
                                <Checkbox 
                                  checked={true}
                                  onCheckedChange={() => handleToggleComplete(todo)}
                                  className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-600 dark:text-gray-400 line-through">
                                    {todo.title}
                                  </h4>
                                  {project && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      <Folder className="w-3 h-3 mr-1" />
                                      {project.name}
                                    </Badge>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteTodoMutation.mutate(todo.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
