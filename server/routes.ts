import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Tasks routes
  // Get all tasks for the authenticated user
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });

  // Create a new task
  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const taskData = { ...req.body, userId };
      
      // Validate task data
      const validationResult = insertTaskSchema.safeParse(taskData);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: validationResult.error.format() 
        });
      }
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Get a single task by ID
  app.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Ensure the task belongs to the authenticated user
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve task" });
    }
  });

  // Update a task
  app.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Validate task data
      const validationResult = updateTaskSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: validationResult.error.format() 
        });
      }
      
      // Check if the task exists and belongs to the user
      const existingTask = await storage.getTaskById(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (existingTask.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Check if the task exists and belongs to the user
      const existingTask = await storage.getTaskById(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (existingTask.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
