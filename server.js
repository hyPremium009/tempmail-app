const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ✅ CONNECT MONGODB
mongoose.connect("mongodb+srv://Admin:HyPremium@123.z01wssi.mongodb.net/hypremium?retryWrites=true&w=majority")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err));

// USER MODEL
const User = mongoose.model("User", {
  username: String,
  password: String
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const cek = await User.findOne({ username });
  if (cek) return res.json({ error: "User sudah ada!" });

  await User.create({ username, password });
  res.json({ status: "Register berhasil!" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ error: "Login gagal!" });

  res.json({ status: "Login sukses!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server jalan di port ${PORT}`));