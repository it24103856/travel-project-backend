import express from "express";
import { 
    createBooking,
    getAllBookings, // සියල්ල ලබා ගැනීම
    getSingleBooking, 
    updateBookingStatus, 
    deleteBooking ,
    getBookingsByUserId
} from "../controllers/bookingController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Public Routes ---
router.post("/create",protect, createBooking); // පාරිභෝගිකයාට booking එකක් කිරීමට

// --- Admin Only Routes ---
// 1. සියලුම Bookings බැලීමට (Table එකක් පෙන්වීමට මෙය අවශ්‍ය වේ)
router.get("/all", protect, isAdmin, getAllBookings); 

// 2. එක් විශේෂිත Booking එකක විස්තර බැලීමට
router.get("/get/:id", protect, getSingleBooking);

// 3. Status එක (Pending/Confirmed/Cancelled) වෙනස් කිරීමට
router.put("/update-status/:id", protect, isAdmin, updateBookingStatus);

// 4. Booking එකක් ඉවත් කිරීමට
router.delete("/delete/:id", protect, isAdmin, deleteBooking);

router.get("/user/:userId", getBookingsByUserId);
export default router;