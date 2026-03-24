import { Router } from "express";

const router = Router();

// Get reviews
router.get("/reviews", (req, res) => {
  res.json({
    reviews: [
      { authorName: "User1", rating: 5, comment: "Amazing!" },
      { authorName: "User2", rating: 4, comment: "Good app!" },
    ],
  });
});

// Post review
router.post("/reviews", (req, res) => {
  res.json({
    message: "Review submitted successfully",
  });
});

export default router;
