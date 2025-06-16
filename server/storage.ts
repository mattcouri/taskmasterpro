import { 
  users, meetings, todos, projects, scheduledItems, passwords, goals, 
  habitTracking, habitLegends, accounts, transactions, financialGoals, healthScores,
  type User, type InsertUser, type Meeting, type InsertMeeting, type Todo, type InsertTodo,
  type Project, type InsertProject, type ScheduledItem, type InsertScheduledItem,
  type Password, type InsertPassword, type Goal, type InsertGoal,
  type HabitTracking, type InsertHabitTracking, type HabitLegend, type InsertHabitLegend,
  type Account, type InsertAccount, type Transaction, type InsertTransaction,
  type FinancialGoal, type InsertFinancialGoal, type HealthScore, type InsertHealthScore
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Meeting operations
  getMeetingsByUserAndDate(userId: number, date: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;

  // Todo operations
  getTodosByUser(userId: number): Promise<Todo[]>;
  getTodosByProject(userId: number, projectId: number): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<boolean>;

  // Project operations
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Scheduled item operations
  getScheduledItemsByUserAndDate(userId: number, date: string): Promise<ScheduledItem[]>;
  createScheduledItem(item: InsertScheduledItem): Promise<ScheduledItem>;
  updateScheduledItem(id: number, item: Partial<InsertScheduledItem>): Promise<ScheduledItem | undefined>;
  deleteScheduledItem(id: number): Promise<boolean>;

  // Password operations
  getPasswordsByUser(userId: number): Promise<Password[]>;
  createPassword(password: InsertPassword): Promise<Password>;
  updatePassword(id: number, password: Partial<InsertPassword>): Promise<Password | undefined>;
  deletePassword(id: number): Promise<boolean>;

  // Goal operations
  getGoalsByUser(userId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Habit tracking operations
  getHabitTrackingByUserAndMonth(userId: number, month: number, year: number): Promise<HabitTracking[]>;
  createHabitTracking(tracking: InsertHabitTracking): Promise<HabitTracking>;
  updateHabitTracking(id: number, tracking: Partial<InsertHabitTracking>): Promise<HabitTracking | undefined>;
  getHabitLegendsByUser(userId: number): Promise<HabitLegend[]>;
  createHabitLegend(legend: InsertHabitLegend): Promise<HabitLegend>;
  updateHabitLegend(id: number, legend: Partial<InsertHabitLegend>): Promise<HabitLegend | undefined>;
  deleteHabitLegend(id: number): Promise<boolean>;

  // Account operations
  getAccountsByUser(userId: number): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;

  // Transaction operations
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getTransactionsByAccount(accountId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Financial goal operations
  getFinancialGoalsByUser(userId: number): Promise<FinancialGoal[]>;
  createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal>;
  updateFinancialGoal(id: number, goal: Partial<InsertFinancialGoal>): Promise<FinancialGoal | undefined>;
  deleteFinancialGoal(id: number): Promise<boolean>;

  // Health score operations
  getHealthScoresByUser(userId: number): Promise<HealthScore[]>;
  getHealthScoreByUserAndMonth(userId: number, month: number, year: number): Promise<HealthScore | undefined>;
  createHealthScore(score: InsertHealthScore): Promise<HealthScore>;
  updateHealthScore(id: number, score: Partial<InsertHealthScore>): Promise<HealthScore | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetings: Map<number, Meeting>;
  private todos: Map<number, Todo>;
  private projects: Map<number, Project>;
  private scheduledItems: Map<number, ScheduledItem>;
  private passwords: Map<number, Password>;
  private goals: Map<number, Goal>;
  private habitTracking: Map<number, HabitTracking>;
  private habitLegends: Map<number, HabitLegend>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private financialGoals: Map<number, FinancialGoal>;
  private healthScores: Map<number, HealthScore>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.meetings = new Map();
    this.todos = new Map();
    this.projects = new Map();
    this.scheduledItems = new Map();
    this.passwords = new Map();
    this.goals = new Map();
    this.habitTracking = new Map();
    this.habitLegends = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.financialGoals = new Map();
    this.healthScores = new Map();
    this.currentId = 1;

    // Initialize with default user and sample habit legends
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const defaultUser = await this.createUser({ username: "demo", password: "demo" });
    
    // Create default habit legends
    const defaultLegends = [
      { userId: defaultUser.id, iconKey: "completed", label: "Completed", icon: "CheckCircle", color: "#10B981" },
      { userId: defaultUser.id, iconKey: "not_completed", label: "Not Completed", icon: "X", color: "#EF4444" },
      { userId: defaultUser.id, iconKey: "not_applicable", label: "Not Applicable", icon: "Minus", color: "#6B7280" },
      { userId: defaultUser.id, iconKey: "partial", label: "Partial", icon: "Circle", color: "#F59E0B" }
    ];

    for (const legend of defaultLegends) {
      await this.createHabitLegend(legend);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMeetingsByUserAndDate(userId: number, date: string): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(
      meeting => meeting.userId === userId && meeting.date === date
    );
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.currentId++;
    const meeting: Meeting = { 
      ...insertMeeting, 
      id,
      color: insertMeeting.color ?? null
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const existing = this.meetings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...meeting };
    this.meetings.set(id, updated);
    return updated;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    return this.meetings.delete(id);
  }

  async getTodosByUser(userId: number): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter(todo => todo.userId === userId);
  }

  async getTodosByProject(userId: number, projectId: number): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter(
      todo => todo.userId === userId && todo.projectId === projectId
    );
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = this.currentId++;
    const todo: Todo = { 
      ...insertTodo, 
      id, 
      createdAt: new Date(),
      description: insertTodo.description ?? null,
      priority: insertTodo.priority ?? "medium",
      estimatedDuration: insertTodo.estimatedDuration ?? null,
      completed: insertTodo.completed ?? null,
      projectId: insertTodo.projectId ?? null,
      dueDate: insertTodo.dueDate ?? null
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo | undefined> {
    const existing = this.todos.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...todo };
    this.todos.set(id, updated);
    return updated;
  }

  async deleteTodo(id: number): Promise<boolean> {
    return this.todos.delete(id);
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentId++;
    const project: Project = { 
      ...insertProject, 
      id,
      color: insertProject.color ?? null,
      description: insertProject.description ?? null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getScheduledItemsByUserAndDate(userId: number, date: string): Promise<ScheduledItem[]> {
    return Array.from(this.scheduledItems.values()).filter(
      item => item.userId === userId && item.date === date
    );
  }

  async createScheduledItem(insertItem: InsertScheduledItem): Promise<ScheduledItem> {
    const id = this.currentId++;
    const item: ScheduledItem = { 
      ...insertItem, 
      id,
      color: insertItem.color ?? null,
      originalId: insertItem.originalId ?? null
    };
    this.scheduledItems.set(id, item);
    return item;
  }

  async updateScheduledItem(id: number, item: Partial<InsertScheduledItem>): Promise<ScheduledItem | undefined> {
    const existing = this.scheduledItems.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.scheduledItems.set(id, updated);
    return updated;
  }

  async deleteScheduledItem(id: number): Promise<boolean> {
    return this.scheduledItems.delete(id);
  }

  async getPasswordsByUser(userId: number): Promise<Password[]> {
    return Array.from(this.passwords.values()).filter(password => password.userId === userId);
  }

  async createPassword(insertPassword: InsertPassword): Promise<Password> {
    const id = this.currentId++;
    const password: Password = { 
      ...insertPassword, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      url: insertPassword.url ?? null,
      username: insertPassword.username ?? null,
      email: insertPassword.email ?? null,
      notes: insertPassword.notes ?? null
    };
    this.passwords.set(id, password);
    return password;
  }

  async updatePassword(id: number, password: Partial<InsertPassword>): Promise<Password | undefined> {
    const existing = this.passwords.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...password, updatedAt: new Date() };
    this.passwords.set(id, updated);
    return updated;
  }

  async deletePassword(id: number): Promise<boolean> {
    return this.passwords.delete(id);
  }

  async getGoalsByUser(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentId++;
    const goal: Goal = { 
      ...insertGoal, 
      id,
      description: insertGoal.description ?? null,
      targetValue: insertGoal.targetValue ?? null,
      currentValue: insertGoal.currentValue ?? null,
      unit: insertGoal.unit ?? null,
      targetDate: insertGoal.targetDate ?? null,
      isActive: insertGoal.isActive ?? null
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = this.goals.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...goal };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  async getHabitTrackingByUserAndMonth(userId: number, month: number, year: number): Promise<HabitTracking[]> {
    return Array.from(this.habitTracking.values()).filter(tracking => {
      const trackingDate = new Date(tracking.date);
      return tracking.userId === userId && 
             trackingDate.getMonth() + 1 === month && 
             trackingDate.getFullYear() === year;
    });
  }

  async createHabitTracking(insertTracking: InsertHabitTracking): Promise<HabitTracking> {
    const id = this.currentId++;
    const tracking: HabitTracking = { ...insertTracking, id };
    this.habitTracking.set(id, tracking);
    return tracking;
  }

  async updateHabitTracking(id: number, tracking: Partial<InsertHabitTracking>): Promise<HabitTracking | undefined> {
    const existing = this.habitTracking.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...tracking };
    this.habitTracking.set(id, updated);
    return updated;
  }

  async getHabitLegendsByUser(userId: number): Promise<HabitLegend[]> {
    return Array.from(this.habitLegends.values()).filter(legend => legend.userId === userId);
  }

  async createHabitLegend(insertLegend: InsertHabitLegend): Promise<HabitLegend> {
    const id = this.currentId++;
    const legend: HabitLegend = { ...insertLegend, id };
    this.habitLegends.set(id, legend);
    return legend;
  }

  async updateHabitLegend(id: number, legend: Partial<InsertHabitLegend>): Promise<HabitLegend | undefined> {
    const existing = this.habitLegends.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...legend };
    this.habitLegends.set(id, updated);
    return updated;
  }

  async deleteHabitLegend(id: number): Promise<boolean> {
    return this.habitLegends.delete(id);
  }

  async getAccountsByUser(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(account => account.userId === userId);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentId++;
    const account: Account = { 
      ...insertAccount, 
      id,
      isActive: insertAccount.isActive ?? null,
      balance: insertAccount.balance ?? "0.00",
      currency: insertAccount.currency ?? null
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const existing = this.accounts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...account };
    this.accounts.set(id, updated);
    return updated;
  }

  async deleteAccount(id: number): Promise<boolean> {
    return this.accounts.delete(id);
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.userId === userId);
  }

  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.accountId === accountId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date(),
      description: insertTransaction.description ?? null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...transaction };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getFinancialGoalsByUser(userId: number): Promise<FinancialGoal[]> {
    return Array.from(this.financialGoals.values()).filter(goal => goal.userId === userId);
  }

  async createFinancialGoal(insertGoal: InsertFinancialGoal): Promise<FinancialGoal> {
    const id = this.currentId++;
    const goal: FinancialGoal = { 
      ...insertGoal, 
      id,
      targetDate: insertGoal.targetDate ?? null,
      isActive: insertGoal.isActive ?? null,
      currentAmount: insertGoal.currentAmount ?? null,
      weeklyAllocation: insertGoal.weeklyAllocation ?? null
    };
    this.financialGoals.set(id, goal);
    return goal;
  }

  async updateFinancialGoal(id: number, goal: Partial<InsertFinancialGoal>): Promise<FinancialGoal | undefined> {
    const existing = this.financialGoals.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...goal };
    this.financialGoals.set(id, updated);
    return updated;
  }

  async deleteFinancialGoal(id: number): Promise<boolean> {
    return this.financialGoals.delete(id);
  }

  async getHealthScoresByUser(userId: number): Promise<HealthScore[]> {
    return Array.from(this.healthScores.values()).filter(score => score.userId === userId);
  }

  async getHealthScoreByUserAndMonth(userId: number, month: number, year: number): Promise<HealthScore | undefined> {
    return Array.from(this.healthScores.values()).find(
      score => score.userId === userId && score.month === month && score.year === year
    );
  }

  async createHealthScore(insertScore: InsertHealthScore): Promise<HealthScore> {
    const id = this.currentId++;
    const score: HealthScore = { 
      ...insertScore, 
      id,
      notes: insertScore.notes ?? null,
      spiritualScore: insertScore.spiritualScore ?? null,
      mentalScore: insertScore.mentalScore ?? null,
      socialScore: insertScore.socialScore ?? null,
      physicalScore: insertScore.physicalScore ?? null,
      financialScore: insertScore.financialScore ?? null
    };
    this.healthScores.set(id, score);
    return score;
  }

  async updateHealthScore(id: number, score: Partial<InsertHealthScore>): Promise<HealthScore | undefined> {
    const existing = this.healthScores.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...score };
    this.healthScores.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
