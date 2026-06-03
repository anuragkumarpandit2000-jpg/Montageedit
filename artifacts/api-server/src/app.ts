import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import { v2 as cloudinary } from "cloudinary";
import pool from "./db";
import path from "path";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userEmail: string;
    isAdmin: boolean;
  }
}

const app: Express = express();

app.set("trust proxy", 1);

const ADMIN_EMAILS = new Set([
  "anuragkumar.pandit2000@gmail.com",
  (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
].filter(Boolean));
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "Anurag.ai").trim();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedOrigins = [
  "https://montageparker.netlify.app",
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "montage.sid",
    secret: process.env.SESSION_SECRET || "montage-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

  if (
    ADMIN_EMAILS.has(email.toLowerCase()) &&
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
/* 🚪 LOGOUT */
/* ============================= */
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
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
/* 📦 STORAGE - REQUEST UPLOAD URL */
/* ============================= */
app.post("/api/storage/uploads/request-url", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Only admin can upload" });
  }

  const { name, contentType } = req.body;

  if (!name || !contentType) {
    return res.status(400).json({ error: "name and contentType required" });
  }

  try {
    const isVideo = contentType.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";
    const publicId = `montage_${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        public_id: publicId,
        resource_type: resourceType,
        folder: "montageedit",
      },
      process.env.CLOUDINARY_API_SECRET || ""
    );

    const uploadURL = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
    const objectPath = `/api/videos/object/${encodeURIComponent(publicId)}`;

    res.json({
      uploadURL,
      objectPath,
      fields: {
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp: String(timestamp),
        public_id: publicId,
        folder: "montageedit",
        signature,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/* ============================= */
/* 📹 GET VIDEOS BY CATEGORY */
/* ============================= */
app.get("/api/videos/:category", async (req, res) => {
  if (req.params.category === "object") {
    return res.status(400).json({ error: "Invalid category" });
  }
  try {
    const result = await pool.query(
      "SELECT id, title, category, url, public_id, thumbnail_url, object_path, created_at as \"createdAt\" FROM videos WHERE category=$1 ORDER BY created_at DESC",
      [req.params.category]
    );
    res.json({ videos: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

/* ============================= */
/* 📹 STREAM VIDEO BY ID */
/* ============================= */
app.get("/api/videos/:id/stream", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const result = await pool.query("SELECT url FROM videos WHERE id=$1", [id]);
    const video = result.rows[0];
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.redirect(video.url);
  } catch (err) {
    res.status(500).json({ error: "Failed to stream video" });
  }
});

/* ============================= */
/* 📹 POST VIDEO (save metadata) */
/* ============================= */
app.post("/api/videos", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Only admin can save videos" });
  }

  const { title, category, objectPath, thumbnailUrl } = req.body;

  if (!title || !category || !objectPath) {
    return res.status(400).json({ error: "title, category, and objectPath required" });
  }

  try {
    const publicId = decodeURIComponent(objectPath.replace("/api/videos/object/", ""));
    const url = cloudinary.url(publicId, { resource_type: "video", secure: true });

    const result = await pool.query(
      `INSERT INTO videos (title, category, url, public_id, thumbnail_url, object_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, category, url, public_id, thumbnail_url, object_path, created_at as "createdAt"`,
      [title, category, url, publicId, thumbnailUrl || null, objectPath]
    );

    res.json({ video: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save video" });
  }
});

/* ============================= */
/* 🗑️ DELETE VIDEO */
/* ============================= */
app.delete("/api/videos/:id", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Only admin can delete videos" });
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const result = await pool.query("SELECT public_id FROM videos WHERE id=$1", [id]);
    const video = result.rows[0];
    if (!video) return res.status(404).json({ error: "Video not found" });

    if (video.public_id && process.env.CLOUDINARY_API_SECRET) {
      try {
        await cloudinary.uploader.destroy(video.public_id, { resource_type: "video" });
      } catch (e) {
        console.error("Cloudinary delete error:", e);
      }
    }

    await pool.query("DELETE FROM videos WHERE id=$1", [id]);
    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete video" });
  }
});

/* ============================= */
/* ⭐ GET REVIEWS */
/* ============================= */
app.get("/api/reviews", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, author_name as "authorName", rating, comment, created_at as "createdAt"
       FROM reviews ORDER BY created_at DESC`
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/* ============================= */
/* ⭐ POST REVIEW */
/* ============================= */
app.post("/api/reviews", async (req, res) => {
  if (!req.session.userId && req.session.userId !== 0) {
    return res.status(401).json({ error: "Must be logged in to submit a review" });
  }

  const { authorName, rating, comment } = req.body;

  if (!authorName || !rating || !comment) {
    return res.status(400).json({ error: "authorName, rating, and comment required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (author_name, rating, comment, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, author_name as "authorName", rating, comment, created_at as "createdAt"`,
      [authorName.trim(), rating, comment.trim(), req.session.userId]
    );
    res.json({ review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit review" });
  }
});

/* ============================= */
/* 📊 STATS */
/* ============================= */
app.get("/api/stats", async (req, res) => {
  try {
    const result = await pool.query("SELECT visitor_count FROM site_stats LIMIT 1");
    res.json({ visitorCount: result.rows[0]?.visitor_count ?? 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.post("/api/stats/visit", async (req, res) => {
  try {
    await pool.query(
      "UPDATE site_stats SET visitor_count = visitor_count + 1, updated_at = NOW()"
    );
    const result = await pool.query("SELECT visitor_count FROM site_stats LIMIT 1");
    res.json({ visitorCount: result.rows[0]?.visitor_count ?? 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to update stats" });
  }
});

/* ============================= */
/* 🖥️ GET WEBAPPS */
/* ============================= */
app.get("/api/webapps", async (req, res) => {
  if (!req.session.userId && req.session.userId !== 0) {
    return res.status(401).json({ error: "Login required" });
  }
  try {
    const result = await pool.query(
      `SELECT id, title, website_url as "websiteUrl", thumbnail_url as "thumbnailUrl", created_at as "createdAt"
       FROM webapps ORDER BY created_at DESC`
    );
    res.json({ webapps: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch webapps" });
  }
});

/* ============================= */
/* 🖥️ POST WEBAPP */
/* ============================= */
app.post("/api/webapps", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }
  const { title, websiteUrl, thumbnailUrl } = req.body;
  if (!title || !websiteUrl) {
    return res.status(400).json({ error: "title and websiteUrl required" });
  }
  try {
    let resolvedThumb = thumbnailUrl || null;
    if (resolvedThumb && !resolvedThumb.startsWith("http")) {
      const publicId = decodeURIComponent(resolvedThumb.replace("/api/videos/object/", ""));
      resolvedThumb = cloudinary.url(publicId, { resource_type: "image", secure: true });
    }
    const result = await pool.query(
      `INSERT INTO webapps (title, website_url, thumbnail_url)
       VALUES ($1, $2, $3)
       RETURNING id, title, website_url as "websiteUrl", thumbnail_url as "thumbnailUrl", created_at as "createdAt"`,
      [title.trim(), websiteUrl.trim(), resolvedThumb]
    );
    res.json({ webapp: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to save webapp" });
  }
});

/* ============================= */
/* 🗑️ DELETE WEBAPP */
/* ============================= */
app.delete("/api/webapps/:id", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    await pool.query("DELETE FROM webapps WHERE id=$1", [id]);
    res.json({ message: "Webapp deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete webapp" });
  }
});

/* ============================= */
/* 🏥 HEALTH */
/* ============================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ============================= */
/* 🌐 SERVE FRONTEND (production) */
/* ============================= */
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(process.cwd(), "artifacts/montage/dist/public");
  app.use(express.static(frontendDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
