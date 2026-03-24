import { Router } from "express";

const router = Router();

/* POST /stats/visit */
router.post("/stats/visit", (req, res) => {
  res.json({
    visitorCount: 100,
    isReal: false,
  });
});

/* GET /stats */
router.get("/stats", (req, res) => {
  res.json({
    visitorCount: 100,
    isReal: false,
    avgRating: 4.5,
    reviewCount: 10,
  });
});

export default router;
