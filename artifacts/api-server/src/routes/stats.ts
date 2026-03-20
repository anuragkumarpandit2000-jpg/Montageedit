import { Router } from "express";
import { db } from "@workspace/db";
import { reviews, siteStats } from "@workspace/db";
import { eq, avg, count } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

const FAKE_BASE = 19_847; // non-admin users see real + this

/* ── Ensure the single stats row exists ── */
async function ensureStatsRow() {
  const existing = await db.select().from(siteStats).where(eq(siteStats.id, 1));
  if (existing.length === 0) {
    await db.insert(siteStats).values({ id: 1, visitorCount: 0 });
  }
}

/* POST /stats/visit — increment counter, return counts */
router.post("/stats/visit", async (req: any, res) => {
  try {
    await ensureStatsRow();
    await db
      .update(siteStats)
      .set({ visitorCount: sql`visitor_count + 1` })
      .where(eq(siteStats.id, 1));

    const [row] = await db.select().from(siteStats).where(eq(siteStats.id, 1));
    const isAdmin = !!(req.session as any)?.isAdmin;
    const realCount = row?.visitorCount ?? 0;

    return res.json({
      visitorCount: isAdmin ? realCount : realCount + FAKE_BASE,
      isReal: isAdmin,
    });
  } catch (err) {
    console.error("Stats visit error:", err);
    return res.status(500).json({ error: "Failed to update stats" });
  }
});

/* GET /stats — rating summary + visitor count */
router.get("/stats", async (req: any, res) => {
  try {
    await ensureStatsRow();
    const [row] = await db.select().from(siteStats).where(eq(siteStats.id, 1));
    const isAdmin = !!(req.session as any)?.isAdmin;
    const realCount = row?.visitorCount ?? 0;

    const reviewRows = await db.select().from(reviews);
    const totalReviews = reviewRows.length;
    const avgRating =
      totalReviews > 0
        ? reviewRows.reduce((s, r) => s + r.rating, 0) / totalReviews
        : 0;

    return res.json({
      visitorCount: isAdmin ? realCount : realCount + FAKE_BASE,
      isReal: isAdmin,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: totalReviews,
    });
  } catch (err) {
    console.error("Stats get error:", err);
    return res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
