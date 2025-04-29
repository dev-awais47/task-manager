import { users, tasks, type User, type InsertUser, type Task, type InsertTask, type UpdateTask } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTasksByUserId(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: UpdateTask): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date() 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskData: UpdateTask): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    if (!this.tasks.has(id)) {
      throw new Error(`Task with id ${id} not found`);
    }
    this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
