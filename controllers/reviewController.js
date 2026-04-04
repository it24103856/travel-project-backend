import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const userId = req.user.id; 

      
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking එක හමු නොවීය." });
        }

       
        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "ඔබට මෙම Booking එකට Review කිරීමට අවසර නැත." });
        }

        
        if (booking.status !== "Confirmed") {
            return res.status(400).json({ success: false, message: "Review කිරීමට නම් Booking එක Confirmed විය යුතුයි." });
        }

        // 4. Checkout දිනය පරීක්ෂා කිරීම
        const now = new Date();
        const checkOutDate = new Date(booking.checkOut);

        if (now < checkOutDate) {
            return res.status(400).json({ 
                success: false, 
                message: "ඔබට Review එකක් ලබා දිය හැක්කේ Checkout දිනයෙන් පසුව පමණි." 
            });
        }

        // 5. දැනටමත් Review එකක් දී ඇත්දැයි බැලීම
        const alreadyReviewed = await Review.findOne({ bookingId });
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "ඔබ දැනටමත් මෙම සංචාරය සඳහා Review එකක් ලබා දී ඇත." });
        }

        // 6. Review එක නිර්මාණය
        const newReview = new Review({
            bookingId,
            userId,
            hotelId: booking.hotelId,
            packageId: booking.packageId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({ success: true, message: "ස්තුතියි! ඔබේ Review එක සාර්ථකව ලැබුණා." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Hotel එකකට අදාළ සියලුම reviews ලබා ගැනීම
export const getHotelReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ hotelId: req.params.hotelId }).populate("userId", "firstName lastName");
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Package එකකට අදාළ සියලුම reviews ලබා ගැනීම
export const getPackageReviews = async (req, res) => {
    try {
        const { packageId } = req.params;

        // PackageId එක හරහා Review සොයා ගැනීම
        // මෙහිදී populate පාවිච්චි කරන්නේ User ගේ නම ලබා ගැනීමටයි
        const reviews = await Review.find({ packageId })
            .populate("userId", "firstName lastName")
            .sort({ createdAt: -1 }); // අලුත්ම reviews ඉහළට එන සේ

        res.status(200).json({ 
            success: true, 
            count: reviews.length, 
            data: reviews 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};