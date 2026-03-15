import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@workspace/db";
import { users, passwordResetTokens } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { sendPasswordResetEmail } from "../lib/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "anuragkumar.pandit2000@gmail.com";
const ADMIN_PASSWORD = "Anurag.ai";

const router = Router();

/* ─── Register ─────────────────────────────────────────── */
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

/* ─── Login ─────────────────────────────────────────────── */
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

    let valid = await bcrypt.compare(password, user.passwordHash);

    /* ── Admin special handling ── */
    if (user.email === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        // If entered password matches the admin password, ensure hash is correct
        if (!valid) {
          const newHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
          await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
          valid = true;
        }
      } else {
        // Wrong password for admin → silently reset hash for next attempt
        const newHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
        return res.status(401).json({ error: "Invalid email or password" });
      }
    }

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

/* ─── Logout ─────────────────────────────────────────────── */
router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("montage.sid");
    return res.json({ success: true });
  });
});

/* ─── Me ─────────────────────────────────────────────────── */
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

/* ─── Forgot Password ─────────────────────────────────────── */
router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  // Always return success to avoid leaking whether email exists
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

      const siteUrl =
        process.env.SITE_URL ||
        (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:3000");
      const resetLink = `${siteUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, resetLink);
    }
  } catch (err) {
    console.error("Forgot password error:", err);
  }
  return res.json({ success: true, message: "If that email is registered, a reset link has been sent." });
});

/* ─── Reset Password ──────────────────────────────────────── */
router.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!record) {
      return res.status(400).json({ error: "This reset link is invalid or has expired." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, record.id));

    return res.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;
