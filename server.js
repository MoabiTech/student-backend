const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ PostgreSQL (Neon)
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_W2fQCxI4lHBT@ep-shy-dust-anqc2xqs-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

// ✅ Test connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL ✅"))
  .catch(err => console.error("DB Error ❌", err));

// ✅ Ensure table exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20)
      );
    `);
    console.log("Table ready ✅");
  } catch (err) {
    console.error("Table error ❌", err);
  }
})();

// ✅ Save student
app.post("/add-student", async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  try {
    await pool.query(
      "INSERT INTO students (first_name, last_name, phone) VALUES ($1, $2, $3)",
      [firstName, lastName, phone]
    );

    res.json({ message: "Saved to PostgreSQL ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get students
app.get("/students", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
