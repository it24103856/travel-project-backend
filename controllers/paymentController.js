import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

export const createManualPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod, receiptUrl, paymentDetails, transactionId } = req.body;

        if (!bookingId || !amount || !paymentMethod) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields." 
            });
        }

        const newPayment = new Payment({
            userId: req.user.id,
            bookingId,
            amount,
            paymentMethod,
            transactionId: transactionId || null,
            receiptUrl: receiptUrl || null,
            paymentDetails: {
                bankName: paymentDetails?.bankName || "Manual Payment",
                paymentDate: paymentDetails?.paymentDate || new Date(),
                paidAmount: amount
            },
            paymentStatus: "processing",
            metadata: { adminNotes: "Awaiting manual verification" }
        });

        await newPayment.save();
        res.status(201).json({ success: true, message: "Payment submitted successfully." });
    } catch (error) {
        console.error("Create Payment Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllPendingPayments = async (req, res) => {
    try {
        const pendingPayments = await Payment.find({ paymentStatus: "processing" })
            .populate("userId", "firstName email") 
            .populate("bookingId")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: pendingPayments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }   
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

        payment.paymentStatus = status;
        await payment.save();

        if (status === "completed") {
            await Booking.findByIdAndUpdate(payment.bookingId, { bookingStatus: "confirmed" });
        }

        res.status(200).json({ success: true, message: "Payment and Booking status updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyPayments = async (req, res) => {
    try {
        const myPayments = await Payment.find({ userId: req.user.id })
            .populate("bookingId")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: myPayments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const requestPaymentCancel = async (req, res) => {
    try {
        const { paymentId, reason } = req.body;
        const payment = await Payment.findOne({ _id: paymentId, userId: req.user.id });

        if (!payment) return res.status(404).json({ success: false, message: "Payment record not found." });
        
        payment.paymentStatus = "cancel_requested";
        if (!payment.metadata) payment.metadata = {};
        payment.metadata.cancelReason = reason || "Customer requested cancellation.";
        await payment.save();

        res.status(200).json({ success: true, message: "Cancellation request sent." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveCancelRequest = async (req, res) => {
    try {
        const { paymentId, status } = req.body; 
        const payment = await Payment.findById(paymentId);

        if (!payment || payment.paymentStatus !== "cancel_requested") {
            return res.status(400).json({ success: false, message: "No active cancellation request found." });
        }

        payment.paymentStatus = status;
        if (status === "refunded") {
            await Booking.findByIdAndUpdate(payment.bookingId, { bookingStatus: "cancelled" });
        }

        await payment.save();
        res.status(200).json({ success: true, message: `Payment ${status} successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        await Payment.findByIdAndDelete(paymentId);
        res.status(200).json({ success: true, message: "Payment deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'firstName email')
            .sort({ createdAt: -1 }); 
        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};