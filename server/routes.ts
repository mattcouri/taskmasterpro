import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMeetingSchema, insertTodoSchema, insertProjectSchema, insertScheduledItemSchema,
  insertPasswordSchema, insertGoalSchema, insertHabitTrackingSchema, insertHabitLegendSchema,
  insertAccountSchema, insertTransactionSchema, insertFinancialGoalSchema, insertHealthScoreSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const currentUserId = 1; // For demo purposes, using fixed user ID

  // Meetings routes
  app.get("/api/meetings/:date", async (req, res) => {
    try {
      const meetings = await storage.getMeetingsByUserAndDate(currentUserId, req.params.date);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse({ ...req.body, userId: currentUserId });
      const meeting = await storage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ message: "Invalid meeting data" });
    }
  });

  app.put("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meetingData = insertMeetingSchema.partial().parse(req.body);
      const meeting = await storage.updateMeeting(id, meetingData);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ message: "Invalid meeting data" });
    }
  });

  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMeeting(id);
      if (!deleted) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Todos routes
  app.get("/api/todos", async (req, res) => {
    try {
      const todos = await storage.getTodosByUser(currentUserId);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const todoData = insertTodoSchema.parse({ ...req.body, userId: currentUserId });
      const todo = await storage.createTodo(todoData);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Invalid todo data" });
    }
  });

  app.put("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const todoData = insertTodoSchema.partial().parse(req.body);
      const todo = await storage.updateTodo(id, todoData);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Invalid todo data" });
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    try {    
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTodo(id);
      if (!deleted) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjectsByUser(currentUserId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({ ...req.body, userId: currentUserId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  // Scheduled items routes
  app.get("/api/scheduled-items/:date", async (req, res) => {
    try {
      const items = await storage.getScheduledItemsByUserAndDate(currentUserId, req.params.date);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scheduled items" });
    }
  });

  app.post("/api/scheduled-items", async (req, res) => {
    try {
      const itemData = insertScheduledItemSchema.parse({ ...req.body, userId: currentUserId });
      const item = await storage.createScheduledItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid scheduled item data" });
    }
  });

  app.put("/api/scheduled-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = insertScheduledItemSchema.partial().parse(req.body);
      const item = await storage.updateScheduledItem(id, itemData);
      if (!item) {
        return res.status(404).json({ message: "Scheduled item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid scheduled item data" });
    }
  });

  app.delete("/api/scheduled-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteScheduledItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Scheduled item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scheduled item" });
    }
  });

  // Passwords routes
  app.get("/api/passwords", async (req, res) => {
    try {
      const passwords = await storage.getPasswordsByUser(currentUserId);
      res.json(passwords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch passwords" });
    }
  });

  app.post("/api/passwords", async (req, res) => {
    try {
      const passwordData = insertPasswordSchema.parse({ ...req.body, userId: currentUserId });
      const password = await storage.createPassword(passwordData);
      res.json(password);
    } catch (error) {
      res.status(400).json({ message: "Invalid password data" });
    }
  });

  app.put("/api/passwords/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const passwordData = insertPasswordSchema.partial().parse(req.body);
      const password = await storage.updatePassword(id, passwordData);
      if (!password) {
        return res.status(404).json({ message: "Password not found" });
      }
      res.json(password);
    } catch (error) {
      res.status(400).json({ message: "Invalid password data" });
    }
  });

  app.delete("/api/passwords/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePassword(id);
      if (!deleted) {
        return res.status(404).json({ message: "Password not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete password" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoalsByUser(currentUserId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse({ ...req.body, userId: currentUserId });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  // Habit tracking routes
  app.get("/api/habit-tracking/:month/:year", async (req, res) => {
    try {
      const month = parseInt(req.params.month);
      const year = parseInt(req.params.year);
      const tracking = await storage.getHabitTrackingByUserAndMonth(currentUserId, month, year);
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit tracking" });
    }
  });

  app.post("/api/habit-tracking", async (req, res) => {
    try {
      const trackingData = insertHabitTrackingSchema.parse({ ...req.body, userId: currentUserId });
      const tracking = await storage.createHabitTracking(trackingData);
      res.json(tracking);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit tracking data" });
    }
  });

  app.get("/api/habit-legends", async (req, res) => {
    try {
      const legends = await storage.getHabitLegendsByUser(currentUserId);
      res.json(legends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit legends" });
    }
  });

  app.post("/api/habit-legends", async (req, res) => {
    try {
      const legendData = insertHabitLegendSchema.parse({ ...req.body, userId: currentUserId });
      const legend = await storage.createHabitLegend(legendData);
      res.json(legend);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit legend data" });
    }
  });

  // Accounts routes  
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAccountsByUser(currentUserId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse({ ...req.body, userId: currentUserId });
      const account = await storage.createAccount(accountData);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUser(currentUserId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({ ...req.body, userId: currentUserId });
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Financial goals routes
  app.get("/api/financial-goals", async (req, res) => {
    try {
      const goals = await storage.getFinancialGoalsByUser(currentUserId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial goals" });
    }
  });

  app.post("/api/financial-goals", async (req, res) => {
    try {
      const goalData = insertFinancialGoalSchema.parse({ ...req.body, userId: currentUserId });
      const goal = await storage.createFinancialGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid financial goal data" });
    }
  });

  // Health scores routes
  app.get("/api/health-scores", async (req, res) => {
    try {
      const scores = await storage.getHealthScoresByUser(currentUserId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health scores" });
    }
  });

  app.get("/api/health-scores/:month/:year", async (req, res) => {
    try {
      const month = parseInt(req.params.month);
      const year = parseInt(req.params.year);
      const score = await storage.getHealthScoreByUserAndMonth(currentUserId, month, year);
      res.json(score || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health score" });
    }
  });

  app.post("/api/health-scores", async (req, res) => {
    try {
      const scoreData = insertHealthScoreSchema.parse({ ...req.body, userId: currentUserId });
      const score = await storage.createHealthScore(scoreData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid health score data" });
    }
  });

  app.put("/api/health-scores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scoreData = insertHealthScoreSchema.partial().parse(req.body);
      const score = await storage.updateHealthScore(id, scoreData);
      if (!score) {
        return res.status(404).json({ message: "Health score not found" });
      }
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid health score data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
