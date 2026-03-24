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

export default router;  });
});

/* ─── Forgot Password ─────────────────────────────────────── */
router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
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
