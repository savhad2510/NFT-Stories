import { type Express } from "express";
import { db } from "@db";
import { stories, insertStorySchema } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateStory } from "./ai";

export function setupStoryRoutes(app: Express) {
  app.post("/api/stories", async (req, res) => {
    try {
      const result = insertStorySchema.safeParse({
        ...req.body,
        owner: req.body.wallet, // Map wallet to owner for schema validation
      });

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: result.error.issues.map(i => i.message)
        });
      }

      const { title, prompt } = result.data;
      const wallet = req.body.wallet?.toLowerCase();

      if (!wallet) {
        return res.status(400).json({
          error: "Wallet address is required"
        });
      }

      // Generate the story
      let initialChapter;
      try {
        initialChapter = await generateStory(prompt);
      } catch (error: any) {
        console.error('Story generation error:', error);
        return res.status(500).json({
          error: "Failed to generate story",
          details: error.message
        });
      }

      // Create the story in database
      const [story] = await db.insert(stories).values({
        title,
        currentChapter: initialChapter,
        tokenId: req.body.tokenId || `STORY-${Date.now()}`, // This will be updated after minting
        owner: wallet,
      }).returning();

      res.json(story);
    } catch (error: any) {
      console.error('Story creation error:', error);
      res.status(500).json({
        error: "Failed to create story",
        details: error.message
      });
    }
  });

  // Update story token ID after minting
  app.put("/api/stories/:id", async (req, res) => {
    try {
      const { tokenId } = req.body;
      if (!tokenId) {
        return res.status(400).json({
          error: "Token ID is required"
        });
      }

      const [updated] = await db
        .update(stories)
        .set({ tokenId })
        .where(eq(stories.id, parseInt(req.params.id)))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error('Story update error:', error);
      res.status(500).json({
        error: "Failed to update story",
        details: error.message
      });
    }
  });

  app.get("/api/stories", async (req, res) => {
    try {
      const allStories = await db.select().from(stories).orderBy(stories.createdAt);
      res.json(allStories);
    } catch (error: any) {
      console.error('Error fetching stories:', error);
      res.status(500).json({
        error: "Failed to fetch stories",
        details: error.message
      });
    }
  });

  app.post("/api/stories/:id/evolve", async (req, res) => {
    try {
      const [story] = await db
        .select()
        .from(stories)
        .where(eq(stories.id, parseInt(req.params.id)))
        .limit(1);

      if (!story) {
        return res.status(404).json({
          error: "Story not found"
        });
      }

      const wallet = req.body.wallet?.toLowerCase();
      if (!wallet) {
        return res.status(400).json({
          error: "Wallet address is required"
        });
      }

      if (story.owner.toLowerCase() !== wallet) {
        return res.status(403).json({
          error: "Not authorized"
        });
      }

      const newChapter = await generateStory(`Continue this story: ${story.currentChapter}`);

      const [updated] = await db
        .update(stories)
        .set({ 
          currentChapter: newChapter, 
          updatedAt: new Date() 
        })
        .where(eq(stories.id, story.id))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error('Story evolution error:', error);
      res.status(500).json({
        error: "Failed to evolve story",
        details: error.message
      });
    }
  });
}