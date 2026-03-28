import { Router } from "express";
import pool from "../db";

const router = Router();

/* ✅ REGISTER */
router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, password]
    );

    res.json({ message: "User registered successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed ❌" });
  }
});

export default router;
