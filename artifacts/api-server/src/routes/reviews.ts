import { Router } from "express";
import { db } from "@workspace/db";
import { reviews } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

router.get("/reviews", async (_req, res) => {
  try {
    const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    return res.json({ reviews: rows });
  } catch (err) {
    console.error("List reviews error:", err);
    return res.status(500).json({ error: "Failed to load reviews" });
  }
});

router.post("/reviews", requireAuth, async (req, res) => {
  const { authorName, rating, comment } = req.body as {
    authorName?: string;
    rating?: number;
    comment?: string;
  };
  if (!authorName || !rating || !comment) {
    return res.status(400).json({ error: "authorName, rating, and comment are required" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }
  if (comment.trim().length < 5) {
    return res.status(400).json({ error: "Comment must be at least 5 characters" });
  }
  try {
    const [review] = await db
      .insert(reviews)
      .values({ authorName: authorName.trim(), rating, comment: comment.trim() })
      .returning();
    return res.status(201).json({ review });
  } catch (err) {
    console.error("Create review error:", err);
    return res.status(500).json({ error: "Failed to submit review" });
  }
});

export default router;
