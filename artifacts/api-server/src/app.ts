import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import pool from "./db";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userEmail: string;
  }
}

const app: Express = express();

app.set("trust proxy", 1);

/* ✅ CORS */
app.use(
  cors({
    origin: "https://montageparker.netlify.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ SESSION */
app.use(
  session({
    name: "montage.sid",
    secret: process.env.SESSION_SECRET || "montage-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none", // 🔥 important for Netlify + Render
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

/* ✅ ROOT */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* ============================= */
/* 🔐 REGISTER */
/* ============================= */
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email.toLowerCase(), password]
    );

    res.json({ message: "User registered 🚀" });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Registration failed" });
  }
});

/* ============================= */
/* 🔐 LOGIN */
/* ============================= */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Wrong password" });
    }

    req.session.userId = user.id;
    req.session.userEmail = user.email;

    res.json({ message: "Login successful 🚀" });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

/* ============================= */
/* 👤 CURRENT USER */
/* ============================= */
app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }

  res.json({
    user: {
      id: req.session.userId,
      email: req.session.userEmail,
    },
  });
});

/* ============================= */
/* 🚪 LOGOUT */
/* ============================= */
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default app;
