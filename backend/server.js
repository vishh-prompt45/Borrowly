const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// 🔌 DATABASE CONNECTION
// =======================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "borrowly_db"
});

db.connect(err => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// =======================
// 🔌 ESP32 SERIAL CONNECT
// =======================

const port = new SerialPort({
  path: "COM10",   // ⚠️ change if yours is different
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let latestUID = "";

parser.on("data", (data) => {
  console.log("📡 UID from ESP32:", data);
  latestUID = data;
});

// =======================
// 🧪 TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Borrowly backend running 🚀");
});

// =======================
// 🔐 AUTH API
// =======================
app.post("/auth", (req, res) => {
  const { uid } = req.body;

  db.query(
    "SELECT * FROM students WHERE rfid_uid = ?",
    [uid],
    (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.length > 0) {
        res.json({ success: true, student: result[0] });
      } else {
        res.json({ success: false, msg: "Invalid card ❌" });
      }
    }
  );
});

// =======================
// 📚 ISSUE BOOK API
// =======================
app.post("/issue", (req, res) => {
  const { uid, isbn } = req.body;

  // Step 1: Check student
  db.query("SELECT * FROM students WHERE rfid_uid = ?", [uid], (err, student) => {
    if (err) return res.status(500).send(err);
    if (student.length === 0)
      return res.json({ success: false, msg: "Invalid student ❌" });

    // Step 2: Check book
    db.query("SELECT * FROM books WHERE isbn = ?", [isbn], (err, book) => {
      if (err) return res.status(500).send(err);
      if (book.length === 0)
        return res.json({ success: false, msg: "Book not found ❌" });

      if (book[0].available_copies <= 0)
        return res.json({ success: false, msg: "No copies available ❌" });

      // 🔥 Step 3: Update EVERYTHING (important order)

      // Update book count
      db.query(
        "UPDATE books SET available_copies = available_copies - 1 WHERE isbn = ?",
        [isbn]
      );

      // ✅ Update student books count
      db.query(
        "UPDATE students SET books_issued = books_issued + 1 WHERE rfid_uid = ?",
        [uid]
      );

      // Insert transaction
      db.query(
        "INSERT INTO transactions (rfid_uid, isbn, type, timestamp) VALUES (?, ?, 'ISSUE', NOW())",
        [uid, isbn]
      );

      res.json({ success: true, msg: "Book Issued ✅" });
    });
  });
});

// =======================
// 🔁 RETURN BOOK API
// =======================
app.post("/return", (req, res) => {
  const { uid, isbn } = req.body;

  // Step 1: Check if issued
  db.query(
    "SELECT * FROM transactions WHERE rfid_uid = ? AND isbn = ? AND type = 'ISSUE'",
    [uid, isbn],
    (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.length === 0)
        return res.json({ success: false, msg: "No issue record found ❌" });

      // 🔥 Step 2: Update EVERYTHING

      // Increase book count
      db.query(
        "UPDATE books SET available_copies = available_copies + 1 WHERE isbn = ?",
        [isbn]
      );

      // ✅ Decrease student books count
      db.query(
        "UPDATE students SET books_issued = books_issued - 1 WHERE rfid_uid = ? AND books_issued > 0",
        [uid]
      );

      // Insert return transaction
      db.query(
        "INSERT INTO transactions (rfid_uid, isbn, type, timestamp) VALUES (?, ?, 'RETURN', NOW())",
        [uid, isbn]
      );

      res.json({ success: true, msg: "Book Returned 🔁" });
    }
  );
});

// =======================
// 📡 RFID SCAN API  <-- ADD HERE
// =======================
app.get("/scan", (req, res) => {
  const uidToSend = latestUID;
  latestUID = "";   // 🔥 CLEAR AFTER SENDING
  res.json({ uid: uidToSend });
});

// =======================
// 🚀 START SERVER
// =======================
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});