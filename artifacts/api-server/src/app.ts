import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import router from "./routes";
import pool from "./db";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userEmail: string;
    isAdmin: boolean;
  }
}

const app: Express = express();

app.set("trust proxy", 1);

/* ✅ CORS (frontend connect) */
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
    secret: process.env.SESSION_SECRET || "montage-cinematic-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

/* ✅ ROOT */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ✅ API ROUTES (optional future use) */
app.use("/api", router);

/* ✅ DB TEST */
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB not connected" });
  }
});

/* ============================= */
/* 🔐 REGISTER */
/* ============================= */
app.post("/register", async (req, res) => {
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

    res.json({ message: "User registered successfully 🚀" });
  } catch (err: any) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Registration failed" });
  }
});

/* ============================= */
/* 🔐 LOGIN */
/* ============================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Wrong password" });
    }

    /* ✅ SESSION SET */
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.isAdmin = false;

    res.json({ message: "Login successful 🚀" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ============================= */
/* 👤 CURRENT USER */
/* ============================= */
app.get("/me", (req, res) => {
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
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

export default app;
