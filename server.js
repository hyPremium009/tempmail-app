require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* =========================
   ROOT (BIAR WEB GA KOSONG)
========================= */
app.get("/", (req, res) => {
  res.send("🔥 TempMail API is running!");
});

/* =========================
   CONNECT MONGODB
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err.message));

/* =========================
   USER MODEL
========================= */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

/* =========================
   EMAIL MODEL
========================= */
const emailSchema = new mongoose.Schema({
  address: String,
  sender: String,
  subject: String,
  body: String,
  createdAt: { type: Date, default: Date.now }
});

const Email = mongoose.model("Email", emailSchema);

/* =========================
   REGISTER
========================= */
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ error: "Isi semua field!" });
    }

    if (password.length < 6) {
      return res.json({ error: "Password minimal 6 karakter!" });
    }

    const cek = await User.findOne({ username });
    if (cek) {
      return res.json({ error: "User sudah ada!" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({ username, password: hashed });

    res.json({ status: "Register berhasil!" });

  } catch (err) {
    res.json({ error: err.message });
  }
});

/* =========================
   LOGIN
========================= */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ error: "User tidak ditemukan!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ error: "Password salah!" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      status: "Login sukses!",
      token
    });

  } catch (err) {
    res.json({ error: err.message });
  }
});

/* =========================
   PROFILE (PROTECTED)
========================= */
app.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.json({ error: "Token tidak ada!" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    res.json(user);

  } catch (err) {
    res.json({ error: "Token tidak valid!" });
  }
});

/* =========================
   GENERATE EMAIL (DOMAIN LU)
========================= */
app.get("/generate", (req, res) => {
  const random = Math.random().toString(36).substring(2, 8);
  const email = `${random}@mail.hyprem.shop`;

  res.json({ email });
});

/* =========================
   INBOX
========================= */
app.get("/inbox/:email", async (req, res) => {
  const emails = await Email.find({ address: req.params.email })
    .sort({ createdAt: -1 });

  res.json(emails);
});

/* =========================
   MAILGUN WEBHOOK (EMAIL MASUK)
========================= */
app.post("/incoming", async (req, res) => {
  try {
    const { sender, subject, body_plain, recipient } = req.body;

    await Email.create({
      address: recipient,
      sender,
      subject,
      body: body_plain
    });

    console.log("📩 Email masuk:", subject);

    res.sendStatus(200);

  } catch (err) {
    console.log("❌ Incoming error:", err.message);
    res.sendStatus(500);
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server jalan di port ${PORT}`);
});