import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupStoryRoutes } from "./story";

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  setupStoryRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
