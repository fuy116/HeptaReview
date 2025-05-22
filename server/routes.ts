import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCardSchema, insertReviewSchema, insertSubjectSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const api = express.Router();

  // Card routes
  api.get("/cards", async (_req, res) => {
    try {
      const cards = await storage.getAllCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  api.get("/cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }

      const card = await storage.getCardById(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      res.json(card);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch card" });
    }
  });

  api.post("/cards", async (req, res) => {
    try {
      const result = insertCardSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid card data", errors: result.error.format() });
      }

      const card = await storage.createCard(result.data);
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ message: "Failed to create card" });
    }
  });

  api.put("/cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }

      // Allow partial updates
      const result = insertCardSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid card data", errors: result.error.format() });
      }

      const updatedCard = await storage.updateCard(id, result.data);
      if (!updatedCard) {
        return res.status(404).json({ message: "Card not found" });
      }

      res.json(updatedCard);
    } catch (error) {
      res.status(500).json({ message: "Failed to update card" });
    }
  });

  api.delete("/cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }

      const success = await storage.deleteCard(id);
      if (!success) {
        return res.status(404).json({ message: "Card not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete card" });
    }
  });

  // Review routes
  api.get("/cards/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }

      const reviews = await storage.getReviewsByCardId(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  api.post("/reviews", async (req, res) => {
    try {
      const result = insertReviewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid review data", errors: result.error.format() });
      }

      const review = await storage.createReview(result.data);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  api.get("/reviews/today", async (_req, res) => {
    try {
      const today = new Date();
      const cards = await storage.getCardsForReview(today);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's reviews" });
    }
  });

  // Subject routes
  api.get("/subjects", async (_req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  api.post("/subjects", async (req, res) => {
    try {
      const result = insertSubjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid subject data", errors: result.error.format() });
      }

      const subject = await storage.createSubject(result.data);
      res.status(201).json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  api.delete("/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }

      const success = await storage.deleteSubject(id);
      if (!success) {
        return res.status(404).json({ message: "Subject not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Statistics routes
  api.get("/stats", async (_req, res) => {
    try {
      const stats = await storage.getCardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  api.get("/stats/subject-distribution", async (_req, res) => {
    try {
      const distribution = await storage.getSubjectDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject distribution" });
    }
  });

  api.get("/stats/familiarity-distribution", async (_req, res) => {
    try {
      const distribution = await storage.getFamiliarityDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch familiarity distribution" });
    }
  });

  // Mount the API router
  app.use("/api", api);

  const httpServer = createServer(app);
  return httpServer;
}
