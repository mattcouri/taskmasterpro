import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DragDropProvider } from "@/components/DragDropProvider";
import Layout from "@/components/Layout";
import DailyPlanner from "@/pages/DailyPlanner";
import Calendar from "@/pages/Calendar";
import TodoList from "@/pages/TodoList";
import PasswordTracker from "@/pages/PasswordTracker";
import GoalTracker from "@/pages/GoalTracker";
import FinanceTracker from "@/pages/FinanceTracker";
import HealthTracker from "@/pages/HealthTracker";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DailyPlanner} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/tasks" component={TodoList} />
      <Route path="/passwords" component={PasswordTracker} />
      <Route path="/goals" component={GoalTracker} />
      <Route path="/finance" component={FinanceTracker} />
      <Route path="/health" component={HealthTracker} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="organizer-theme">
        <TooltipProvider>
          <DragDropProvider>
            <Layout>
              <Toaster />
              <Router />
            </Layout>
          </DragDropProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
