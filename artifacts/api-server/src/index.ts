import app from "./app";
import pool from "./db";

const port = Number(process.env.PORT) || 8080;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

pool.query(`
  CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
  );
  CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
`).catch((err) => {
  console.warn("Session table init warning (non-fatal):", err.message);
});
