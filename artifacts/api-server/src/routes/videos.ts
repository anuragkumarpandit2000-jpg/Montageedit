import { Router } from "express";
import { db } from "@workspace/db";
import { videos } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ObjectStorageService } from "../lib/objectStorage";

const router = Router();
const storageService = new ObjectStorageService();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session.isAdmin) return res.status(403).json({ error: "Admin only" });
  next();
}

router.get("/videos/:category", requireAuth, async (req, res) => {
  const { category } = req.params;
  try {
    const rows = await db.select().from(videos).where(eq(videos.category, category));
    return res.json({ videos: rows });
  } catch (err) {
    console.error("List videos error:", err);
    return res.status(500).json({ error: "Failed to list videos" });
  }
});

router.post("/videos", requireAdmin, async (req, res) => {
  const { title, category, objectPath, thumbnailUrl } = req.body as {
    title?: string;
    category?: string;
    objectPath?: string;
    thumbnailUrl?: string;
  };
  if (!title || !category || !objectPath) {
    return res.status(400).json({ error: "title, category, and objectPath are required" });
  }
  try {
    const [video] = await db
      .insert(videos)
      .values({ title, category, objectPath, thumbnailUrl: thumbnailUrl ?? null })
      .returning();
    return res.json({ video });
  } catch (err) {
    console.error("Create video error:", err);
    return res.status(500).json({ error: "Failed to create video" });
  }
});

router.patch("/videos/:id/thumbnail", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { thumbnailUrl } = req.body as { thumbnailUrl?: string };
  if (isNaN(id) || !thumbnailUrl) return res.status(400).json({ error: "Invalid request" });
  try {
    const [video] = await db.update(videos).set({ thumbnailUrl }).where(eq(videos.id, id)).returning();
    return res.json({ video });
  } catch (err) {
    console.error("Patch thumbnail error:", err);
    return res.status(500).json({ error: "Failed to update thumbnail" });
  }
});

router.delete("/videos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const [video] = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    if (!video) return res.status(404).json({ error: "Video not found" });
    await db.delete(videos).where(eq(videos.id, id));
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete video error:", err);
    return res.status(500).json({ error: "Failed to delete video" });
  }
});

router.get("/videos/:id/stream", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const [video] = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    if (!video) return res.status(404).json({ error: "Not found" });
    const file = await storageService.getObjectEntityFile(video.objectPath);
    const [exists] = await file.exists();
    if (!exists) return res.status(404).json({ error: "File not found in storage" });
    const [metadata] = await file.getMetadata();
    const fileSize = Number(metadata.size ?? 0);
    const contentType = (metadata.contentType as string) || "video/mp4";
    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0]);
      const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });
      file.createReadStream({ start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      });
      file.createReadStream().pipe(res);
    }
  } catch (err) {
    console.error("Stream video error:", err);
    return res.status(500).json({ error: "Failed to stream video" });
  }
});

export default router;
