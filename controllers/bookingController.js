import mongoose from "mongoose"; // This must be included
import Booking from "../models/Booking.js";
import Review from "../models/Review.js"; // Added
import { syncBookingStatusToPayments } from "../services/bookingPaymentSyncService.js";

// --- 1. Create New Booking ---
export const createBooking = async (req, res) => {
    try {
        const requestedStartDateValue = req.body.startDate || req.body.checkIn;
        const requestedEndDateValue = req.body.endDate || req.body.checkOut;

        if (!requestedStartDateValue || !requestedEndDateValue) {
            return res.status(400).json({
                success: false,
                message: "Start and end dates are required."
            });
        }

        const requestedStartDate = new Date(requestedStartDateValue);
        const requestedEndDate = new Date(requestedEndDateValue);

        if (Number.isNaN(requestedStartDate.getTime()) || Number.isNaN(requestedEndDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking date format."
            });
        }

        if (requestedStartDate > requestedEndDate) {
            return res.status(400).json({
                success: false,
                message: "Start date must be before or equal to end date."
            });
        }

        const { driverId, vehicleId } = req.body;
        const resourceFilters = [];

        if (driverId) {
            if (!mongoose.Types.ObjectId.isValid(driverId)) {
                return res.status(400).json({ success: false, message: "Invalid driverId format" });
            }
            resourceFilters.push({ driverId: new mongoose.Types.ObjectId(driverId) });
        }

        if (vehicleId) {
            if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
                return res.status(400).json({ success: false, message: "Invalid vehicleId format" });
            }
            resourceFilters.push({ vehicleId: new mongoose.Types.ObjectId(vehicleId) });
        }

        if (resourceFilters.length > 0) {
            const overlappingBooking = await Booking.findOne({
                $and: [
                    {
                        $or: resourceFilters
                    },
                    {
                        $and: [
                            { checkIn: { $lte: requestedEndDate } },
                            { checkOut: { $gte: requestedStartDate } }
                        ]
                    }
                ]
            });

            if (overlappingBooking) {
                return res.status(409).json({
                    success: false,
                    message: "Driver or Vehicle is already booked for the selected dates."
                });
            }
        }

        const bookingData = {
            ...req.body,
            checkIn: requestedStartDate,
            checkOut: requestedEndDate
        };

        const newBooking = new Booking(bookingData);
        const savedBooking = await newBooking.save();
        res.status(201).json({ success: true, data: savedBooking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- 2. Get All Bookings (Admin View) ---
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("hotelId", "name city") 
            .populate("packageId", "title")
            .populate("userId", "firstName lastName email") 
            .populate("driverId", "name phone") // Driver details
            .populate("vehicleId", "model licensePlate") // Vehicle details
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

        // Attempt to sync booking status to any related payments (non-blocking)
        try {
            await syncBookingStatusToPayments(req.params.id, status);
        } catch (syncError) {
            console.error("Error syncing booking->payments:", syncError.message);
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

// --- 6. Get Bookings By User ID (Important section) ---
export const getBookingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Remove ":" symbol from URL
        const cleanId = userId?.startsWith(":") ? userId.substring(1) : userId;

        // Check if ID is an ObjectId (to prevent crash)
        if (!mongoose.Types.ObjectId.isValid(cleanId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID format" });
        }

        // Database Query - Convert String ID to ObjectId and search
        const customerBookings = await Booking.find({ 
            userId: new mongoose.Types.ObjectId(cleanId) 
        })
        .populate("hotelId") // Get Hotel details from here
        .populate("packageId", "title location no_of_days categories gallery") // Get Package details from here
        .sort({ createdAt: -1 });

        // Fetch all reviews for these bookings in a single query
        const bookingIds = customerBookings.map(b => b._id);
        const reviews = await Review.find({ bookingId: { $in: bookingIds } });

        // Map reviews by bookingId for O(1) lookup
        const reviewMap = {};
        reviews.forEach(r => { reviewMap[r.bookingId.toString()] = r; });

        // Attach review to each booking object
        const bookingsWithReviews = customerBookings.map(b => ({
            ...b.toObject(),
            review: reviewMap[b._id.toString()] || null
        }));

        return res.status(200).json({
            success: true,
            count: bookingsWithReviews.length,
            data: bookingsWithReviews
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