import express from "express";
import axios   from "axios";
import { protect } from "../middleware/authMiddleware.js"; // your JWT middleware
import User from "../models/User.js";

const router = express.Router();

const PYTHON_API = process.env.PYTHON_API_URL || "http://localhost:8000";

// ── POST /api/recommend ────────────────────────────────────────────────────────
// Preference-based recommendation — for new / anonymous users
// Receives preference form data from React, forwards straight to Python
router.post("/", async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_API}/recommend`, req.body);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      success: false,
      message: "Recommendation engine unavailable. Is the Python server running?",
      error:   error.message,
    });
  }
});

// ── POST /api/recommend/behaviour ─────────────────────────────────────────────
// Behaviour-based recommendation — for returning logged-in users
// Fetches the user's profile + interaction logs, then forwards to Python
router.post("/behaviour", protect, async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const authHeader = req.headers.authorization;
    const config     = { headers: { Authorization: authHeader } };
    const baseUrl    = `http://localhost:${process.env.PORT || 3000}`;

    // 1. Fetch user profile to get registration interests (changed)
    const user     = await User.findById(user_id);
    const user_interests = user?.interests || [];

    // 2. Fetch all interaction logs for this user
    const logsRes    = await axios.get(`${baseUrl}/api/interactions/user/${user_id}`, config);
    const interactions = logsRes.data?.data || [];

    // 3. Collect already-booked package IDs to exclude from results
    const already_booked_ids = interactions
      .filter(l => l.action === "booking")
      .map(l => String(l.package_id?._id || l.package_id));

    // 4. Forward to Python behaviour engine
    const pythonRes = await axios.post(`${PYTHON_API}/recommend-behaviour`, {
      user_interests,
      interactions,
      already_booked_ids,
    });

    res.json(pythonRes.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      success: false,
      message: "Behaviour recommendation engine error",
      error:   error.message,
    });
  }
});

export default router;