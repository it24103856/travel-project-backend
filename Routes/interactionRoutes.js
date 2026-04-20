import express from "express";
import InteractionLog from "../models/InteractionLog.js";

const router = express.Router();

// ── POST /api/interactions/log ─────────────────────────────────────────────────
// Called silently from the frontend whenever a user views, rates, or books
router.post("/log", async (req, res) => {
  try {

    console.log("req.user =", req.user);
    console.log("req.body =", req.body);
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ success: false, message: "Not logged in" });

    const { package_id, action, rating, view_duration } = req.body;

    if (!package_id) return res.status(400).json({ success: false, message: "package_id is required" });
    if (!action)     return res.status(400).json({ success: false, message: "action is required" });

    const log = new InteractionLog({
      user_id,
      package_id,
      action,
      rating:        rating        ?? null,
      view_duration: view_duration ?? null,
    });

    const saved = await log.save();
    console.log("✅ Saved:", saved._id, saved.action);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ Save error:", err.message); 
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/interactions/user/:userId ─────────────────────────────────────────
// Fetches all logs for a given user — consumed by the behaviour recommend route
router.get("/user/:userId", async (req, res) => {
  try {
    const logs = await InteractionLog.find({ user_id: req.params.userId })
      .populate(
        "package_id",
        "title categories interests weather location no_of_days"
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/interactions/all ──────────────────────────────────────────────────
// Admin endpoint — returns all interaction logs
router.get("/all", async (req, res) => {
  try {
    const logs = await InteractionLog.find()
      .populate("package_id", "title categories interests weather location no_of_days gallery")
      .sort({ createdAt: -1 });
 
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;