require("dotenv").config();
console.log("MONGO_URI:", process.env.MONGO_URI);
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

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
   REGISTER
========================= */
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ error: "Isi semua field!" });
    }

    const cek = await User.findOne({ username });
    if (cek) {
      return res.json({ error: "User sudah ada!" });
    }

    // HASH PASSWORD 🔒
    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashed
    });

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

    // CEK PASSWORD 🔐
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ error: "Password salah!" });
    }

    // JWT TOKEN 🔑
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
   PROTECTED ROUTE
========================= */
app.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) return res.json({ error: "Token tidak ada!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    res.json(user);

  } catch (err) {
    res.json({ error: "Token tidak valid!" });
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server jalan di port ${PORT}`);
});