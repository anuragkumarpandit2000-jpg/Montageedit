import { Router } from "express";

const router = Router();

// Get videos
router.get("/videos", (req, res) => {
  res.json({
    videos: [
      { title: "Sample Video 1", url: "https://example.com" },
      { title: "Sample Video 2", url: "https://example.com" }
    ]
  });
});

export default router;
