import { CheckSquare, Plus, Star, Circle, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getColorForPriority } from "@/lib/utils";
import DraggableItem from "./DraggableItem";
import type { Todo } from "@shared/schema";

interface TodoPanelProps {
  todos: Todo[];
  isLoading?: boolean;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Star className="w-4 h-4 text-red-500" />;
    case 'medium':
      return <Circle className="w-4 h-4 text-yellow-500" />;
    case 'low':
      return <Minus className="w-4 h-4 text-green-500" />;
    default:
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

export default function TodoPanel({ todos }: TodoPanelProps) {
  const incompleteTodos = todos.filter(todo => !todo.completed);
  const todosByPriority = {
    high: incompleteTodos.filter(todo => todo.priority === 'high'),
    medium: incompleteTodos.filter(todo => todo.priority === 'medium'),
    low: incompleteTodos.filter(todo => todo.priority === 'low'),
  };

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
      </h4>
      <div className="space-y-2">
        {todos.map((todo) => (
          <DraggableItem
            key={todo.id}
            id={`todo-${todo.id}`}
            data={todo}
            className="todo-item"
          >
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-grab">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  checked={todo.completed || false}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {todo.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Est. {todo.estimatedDuration || 30} min
                  </p>
                </div>
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getColorForPriority(priority) }}
                />
              </div>
            </div>
          </DraggableItem>
        ))}
        {todos.length === 0 && (
          <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
            No {priority} priority tasks
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="lg:col-span-1">
      <Card className="glass-panel h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span>To-Do List</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <Plus className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {incompleteTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">All tasks completed!</p>
            </div>
          ) : (
            <div className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
