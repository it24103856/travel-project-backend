import express from "express";
import { 
    createReview, 
    getHotelReviews, 
    getPackageReviews // අලුත් එක මෙතනට add කරන්න
} from "../controllers/ReviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/hotel/:hotelId", getHotelReviews);
router.get("/package/:packageId", getPackageReviews); // Package reviews සඳහා route එක

export default router;