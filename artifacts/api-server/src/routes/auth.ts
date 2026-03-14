import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "anuragkumar.pandit2000@gmail.com";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({ email: email.toLowerCase(), passwordHash }).returning();
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.isAdmin = user.email === ADMIN_EMAIL;
    return res.json({ user: { id: user.id, email: user.email, isAdmin: req.session.isAdmin } });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.isAdmin = user.email === ADMIN_EMAIL;
    return res.json({ user: { id: user.id, email: user.email, isAdmin: req.session.isAdmin } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("montage.sid");
    return res.json({ success: true });
  });
});

router.get("/auth/me", (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  return res.json({
    user: {
      id: req.session.userId,
      email: req.session.userEmail,
      isAdmin: req.session.isAdmin ?? false,
    },
  });
});

export default router;
