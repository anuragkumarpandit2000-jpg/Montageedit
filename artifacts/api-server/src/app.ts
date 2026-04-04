import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

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
      sameSite: "none",
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
    const insertResult = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email.toLowerCase(), password]
    );

    const newUser = insertResult.rows[0];

    req.session.userId = newUser.id;
    req.session.userEmail = newUser.email;
    req.session.isAdmin = false;

    res.json({
      message: "User registered 🚀",
      user: {
        id: newUser.id,
        email: newUser.email,
        isAdmin: false,
      },
    });
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

  // ✅ Admin check
  if (
    email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  ) {
    req.session.userId = 0;
    req.session.userEmail = email.toLowerCase();
    req.session.isAdmin = true;

    return res.json({
      message: "Admin login successful 🚀",
      user: {
        id: 0,
        email: email.toLowerCase(),
        isAdmin: true,
      },
    });
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
    req.session.isAdmin = false;

    res.json({
      message: "Login successful 🚀",
      user: {
        id: user.id,
        email: user.email,
        isAdmin: false,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

/* ============================= */
/* 👤 CURRENT USER */
/* ============================= */
app.get("/api/me", (req, res) => {
  if (!req.session.userId && req.session.userId !== 0) {
    return res.json({ user: null });
  }

  res.json({
    user: {
      id: req.session.userId,
      email: req.session.userEmail,
      isAdmin: req.session.isAdmin || false,
    },
  });
});

/* ============================= */
/* 👥 ADMIN - ALL USERS */
/* ============================= */
app.get("/api/admin/users", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* ============================= */
/* 🚪 LOGOUT */
/* ============================= */
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default app    const result = await pool.query(
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
    req.session.isAdmin = false;

    res.json({
      message: "Login successful 🚀",
      user: {
        id: user.id,
        email: user.email,
        isAdmin: false,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

/* ============================= */
/* 👤 CURRENT USER */
/* ============================= */
app.get("/api/me", (req, res) => {
  if (!req.session.userId && req.session.userId !== 0) {
    return res.json({ user: null });
  }

  res.json({
    user: {
      id: req.session.userId,
      email: req.session.userEmail,
      isAdmin: req.session.isAdmin || false,
    },
  });
});

/* ============================= */
/* 👥 ADMIN - ALL USERS */
/* ============================= */
app.get("/api/admin/users", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
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
