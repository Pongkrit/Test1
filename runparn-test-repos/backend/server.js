const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

// RunParn injects these for DB projects:
// DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
const cfg = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

const PORT = Number(process.env.PORT || 3000);

let pool;

async function initDb() {
  if (!cfg.host || !cfg.user || !cfg.database) {
    console.warn("[demo] DB env vars missing. This app expects RunParn to provide DB_* env vars.");
    return;
  }

  pool = mysql.createPool({
    ...cfg,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
  });

  // Create a simple table so you can prove DB is working
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);

  // Insert a starter row if empty
  const [rows] = await pool.query("SELECT COUNT(*) AS c FROM notes");
  if (rows[0].c === 0) {
    await pool.query("INSERT INTO notes (title) VALUES (?)", ["Hello from RunParn DB demo"]);
  }

  console.log("[demo] Connected to DB and ensured schema.");
}

app.get("/", async (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>RunParn Node+DB Demo</title>
      <style>
        body{font-family:system-ui,Segoe UI,Arial,sans-serif;margin:32px}
        code{background:#f2f2f2;padding:2px 6px;border-radius:8px}
        .muted{color:#666}
        button{padding:8px 12px;border-radius:10px;border:1px solid #ddd;cursor:pointer}
      </style>
    </head>
    <body>
      <h1>RunParn Node + MySQL/MariaDB Demo</h1>
      <p class="muted">This backend is designed to work inside RunParn (reduced scope).</p>
      <p>DB host: <code>${cfg.host || "-"}</code> | DB name: <code>${cfg.database || "-"}</code></p>

      <p><button onclick="loadNotes()">Load notes</button></p>
      <pre id="out" class="muted">Click the button…</pre>

      <script>
        async function loadNotes(){
          const r = await fetch('/api/notes');
          const j = await r.json();
          document.getElementById('out').textContent = JSON.stringify(j, null, 2);
        }
      </script>
    </body>
    </html>
  `);
});

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/notes", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not initialized (missing env vars?)" });
  const [rows] = await pool.query("SELECT id, title, created_at FROM notes ORDER BY id DESC LIMIT 50");
  res.json({ ok: true, notes: rows });
});

app.post("/api/notes", async (req, res) => {
  if (!pool) return res.status(500).json({ ok: false, error: "DB not initialized (missing env vars?)" });
  const title = String(req.body?.title || "").trim();
  if (!title) return res.status(400).json({ ok: false, error: "title is required" });
  await pool.query("INSERT INTO notes (title) VALUES (?)", [title]);
  res.json({ ok: true });
});

// IMPORTANT: bind to 0.0.0.0 for Docker
(async () => {
  try {
    await initDb();
  } catch (e) {
    console.error("[demo] DB init failed:", e?.message || e);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[demo] Listening on 0.0.0.0:${PORT}`);
    console.log("[demo] Environment received:", {
      PORT: process.env.PORT,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER
    });
  });
})();
