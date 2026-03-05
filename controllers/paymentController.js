import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

export const createManualPayment = async (req, res) => {
    try {
        const { 
            userId, 
            bookingId, 
            amount, 
            currency, 
            paymentMethod, 
            transactionId, 
            receiptUrl, 
            metadata 
        } = req.body;

        if (!userId || !bookingId || !amount || !paymentMethod) {
            return res.status(400).json({ message: "අත්‍යවශ්‍ය දත්ත කිහිපයක් අඩුයි." });
        }

        const existingPayment = await Payment.findOne({ bookingId });
        if (existingPayment) {
            return res.status(400).json({ message: "මෙම වෙන්කිරීම සඳහා දැනටමත් ගෙවීමක් ඉදිරිපත් කර ඇත." });
        }

        const newPayment = new Payment({
            userId,
            bookingId,
            amount,
            currency: currency || "LKR",
            paymentMethod,
            transactionId,
            receiptUrl,    
            paymentStatus: "processing", 
            metadata: {
                ...metadata,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            }
        });

        const savedPayment = await newPayment.save();

        res.status(201).json({
            success: true,
            message: "your recept upload ,please give time for check it.",
            data: savedPayment
        });

    } catch (error) {
        console.error("Payment Controller Error:", error);
        res.status(500).json({ message: " (Server Error).", error: error.message });
    }
};

// මෙතැනට අමතර controller functions (updatePaymentStatus, getPaymentByBookingId වැනි) එකතු කරන්න පුළුවන්.

export const getAllPendingPayments = async (req, res) => {
    try {
        const pendingPayments = await Payment.find({ paymentStatus: "processing" })
            .populate("userId", "firstName  email") 
            .populate("bookingId", "hotelId checkInDate checkOutDate totalPrice")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "All pending payments retrieved successfully.",
            data: pendingPayments
        });

    } catch (error) {
        console.error("Payment Controller Error:", error);
        res.status(500).json({ message: " (Server Error).", error: error.message });
    }   

}        

//upadate payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const {status,adminnotes} = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found." });
        }

        payment.paymentStatus = status;

        if(status === "completed"){
            payment.paidAt = new Date();
        }

        if (adminnotes) {
            payment.metadata.adminNotes = adminNotes;
        }

        await payment.save();

        res.status(200).json({
            success: true,
            message: "Payment status updated successfully.",
            data: payment
        })
    } catch (error) {
        console.error("Payment Controller Error:", error);
        res.status(500).json({ message: " (Server Error).", error: error.message });
}
}

//get  Mypayment 
export const getMyPayments = async (req, res) => {
    try{
        const userId = req.user._id;
        const myPayments = await Payment.find({ userId })
        .sort({ createdAt: -1 })
        
        if(!myPayments || myPayments.length === 0){
            return res.status(200).json({ success: true, message: "No payments found for this user.", data: [] });
        }

res.status(200).json({
            success: true,
            count: myPayments.length,
            data: myPayments
        });

    } catch (error) {
        console.error("Payment Controller Error:", error);
        res.status(500).json({ message: " (Server Error).", error: error.message });
    }
}
    
// requset payemnt cancel   

export const requestPaymentCancel = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const userId = req.user._id;

        const payment = await Payment.findOne({ _id: paymentId, userId });

        if (!payment) {
            return res.status(404).json({ message: "ගෙවීම් වාර්තාව සොයාගත නොහැක." });
        }

        if (payment.paymentStatus === 'refunded' || payment.paymentStatus === 'cancel_requested') {
            return res.status(400).json({ message: "මෙම ගෙවීම දැනටමත් අවලංගු කර ඇත හෝ ඉල්ලීමක් යොමු කර ඇත." });
        }

        payment.paymentStatus = "cancel_requested";
        payment.metadata.cancelReason = req.body.reason || "පාරිභෝගිකයා විසින් අවලංගු කිරීමට ඉල්ලන ලදී.";
        
        await payment.save();

        res.status(200).json({ success: true, message: "අවලංගු කිරීමේ ඉල්ලීම සාර්ථකව යොමු කරන ලදී. Admin අනුමත කරන තෙක් රැඳී සිටින්න." });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Cancel Payment (Admin)

export const approveCancelRequest = async (req, res) => {
    try {
        const { paymentId, status } = req.body; 

        const payment = await Payment.findById(paymentId);

        if (!payment || payment.paymentStatus !== "cancel_requested") {
            return res.status(400).json({ message: "අවලංගු කිරීමේ ඉල්ලීමක් සොයාගත නොහැක." });
        }

        payment.paymentStatus = status;

        if (status === "refunded") {
            await Booking.findByIdAndUpdate(payment.bookingId, { bookingStatus: "cancelled" });
        }

        await payment.save();

        res.status(200).json({ success: true, message: `ගෙවීම ${status} ලෙස යාවත්කාලීන කරන ලදී.` });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

