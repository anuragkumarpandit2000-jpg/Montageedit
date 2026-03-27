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

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

/* ✅ ROOT ROUTE (fixes "Cannot GET /") */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ✅ API ROUTES */
app.use("/api", router);

/* ✅ DB TEST ROUTE */
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB not connected" });
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // ✅ basic validation
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

    // ✅ duplicate email handle
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Registration failed" });
  }
});

export default app;
