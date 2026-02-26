// === server.js ===
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/serialDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// 🔹 Schema & Model
const serialSchema = new mongoose.Schema({
  product: { type: String, required: true, unique: true },
  control: { type: String, required: true },
  wifi: { type: String, required: true },
  dispatched: { type: Boolean, default: false } // ✅ REQUIRED
});

const Serial = mongoose.model("Serial", serialSchema);

// ================= ROUTES =================

// 🟢 Get all serials
app.get("/api/serials", async (req, res) => {
  const serials = await Serial.find();
  res.json(serials);
});

// 🔍 Search
app.get("/api/serials/search", async (req, res) => {
  const q = req.query.q || "";
  const serials = await Serial.find({
    $or: [
      { product: { $regex: q, $options: "i" } },
      { control: { $regex: q, $options: "i" } },
      { wifi: { $regex: q, $options: "i" } }
    ]
  });
  res.json(serials);
});

// ➕ Add serial
app.post("/api/serials", async (req, res) => {
  const { product, control, wifi } = req.body;

  if (!product || !control || !wifi) {
    return res.status(400).json({ message: "All fields required" });
  }

  const exists = await Serial.findOne({ product });
  if (exists) {
    return res.status(400).json({ message: "Product already exists" });
  }

  const serial = new Serial({ product, control, wifi });
  await serial.save();

  res.status(201).json(serial);
});

// ✏️ Update serial (includes dispatch)
app.put("/api/serials/:id", async (req, res) => {
  const updated = await Serial.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Serial not found" });
  }

  res.json(updated);
});

// 🚚 Dispatch
app.put("/api/serials/dispatch/:id", async (req, res) => {
  await Serial.findByIdAndUpdate(req.params.id, { dispatched: true });
  res.sendStatus(200);
});

// ❌ Undispatch
app.put("/api/serials/undispatch/:id", async (req, res) => {
  await Serial.findByIdAndUpdate(req.params.id, { dispatched: false });
  res.sendStatus(200);
});

// 🗑 Delete
app.delete("/api/serials/:id", async (req, res) => {
  await Serial.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

// =========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
