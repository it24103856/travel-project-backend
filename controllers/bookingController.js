import mongoose from "mongoose"; // අනිවාර්යයෙන්ම මෙය තිබිය යුතුයි
import Booking from "../models/Booking.js";

// --- 1. Create New Booking ---
export const createBooking = async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        const savedBooking = await newBooking.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Booking successful!", 
            data: savedBooking 
        });
    } catch (error) {
        console.error("Booking Create Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 2. Get All Bookings (Admin View) ---
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("hotelId", "name city") 
            .populate("userId", "firstName lastName email image") 
            .sort({ createdAt: -1 }); 

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 3. Get Single Booking ---
export const getSingleBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("hotelId", "name city address phone email");

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 4. Update Booking Status ONLY ---
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Pending", "Confirmed", "Cancelled"];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Use Pending, Confirmed or Cancelled." 
            });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: { status: status } }, 
            { new: true, runValidators: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: `Booking has been ${status}`, 
            data: updatedBooking 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 5. Delete Booking ---
export const deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ 
            success: true, 
            message: "Booking deleted successfully from database" 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 6. Get Bookings By User ID (වැදගත්ම කොටස) ---
export const getBookingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // URL එකේ ඇති ":" ලකුණ ඉවත් කිරීම
        const cleanId = userId?.startsWith(":") ? userId.substring(1) : userId;

        // ID එක ObjectId එකක් දැයි පරීක්ෂා කිරීම (Crash වීම වැළැක්වීමට)
        if (!mongoose.Types.ObjectId.isValid(cleanId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID format" });
        }

        // Database Query එක - String ID එක ObjectId එකක් බවට පත් කර සෙවීම
        const customerBookings = await Booking.find({ 
            userId: new mongoose.Types.ObjectId(cleanId) 
        })
        .populate("hotelId") // Hotel විස්තර මෙතැනින් ලබා ගනී
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: customerBookings.length,
            data: customerBookings
        });

    } catch (error) {
        console.error("Critical Backend Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};