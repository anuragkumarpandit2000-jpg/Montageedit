import { Router } from "express";

const router = Router();

// Register
router.post("/auth/register", (req, res) => {
  res.json({ message: "Register route working" });
});

// Login
router.post("/auth/login", (req, res) => {
  res.json({ message: "Login route working" });
});

// Logout
router.post("/auth/logout", (req, res) => {
  res.json({ message: "Logout route working" });
});

// Me
router.get("/auth/me", (req, res) => {
  res.json({ user: null });
});

export default router;
