import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

/**
 * Service to synchronize and validate Booking-Payment relationships
 */

/**
 * Validate that a booking exists and payment can be created for it
 * @param {string} bookingId - The booking ID to validate
 * @param {string} userId - The user ID creating the payment
 * @returns {Promise<Object>} - Returns booking data if valid
 */
export const validateBookingForPayment = async (bookingId, userId) => {
    try {
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.userId.toString() !== userId.toString()) {
            throw new Error("Unauthorized: Booking does not belong to this user");
        }

        if (booking.status === "Cancelled") {
            throw new Error("Cannot create payment for a cancelled booking");
        }

        return { valid: true, booking };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

/**
 * Get all payments for a specific booking
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Array>} - Array of payment records
 */
export const getPaymentsByBookingId = async (bookingId) => {
    try {
        const payments = await Payment.find({ bookingId })
            .sort({ createdAt: -1 });
        return payments;
    } catch (error) {
        throw new Error(`Failed to fetch payments for booking: ${error.message}`);
    }
};

/**
 * Check if a payment already exists for a booking
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Object>} - Returns payment data if exists
 */
export const checkExistingPaymentForBooking = async (bookingId) => {
    try {
        const existingPayment = await Payment.findOne({ 
            bookingId, 
            paymentStatus: { $in: ["completed", "processing"] }
        });
        return existingPayment;
    } catch (error) {
        throw new Error(`Failed to check existing payments: ${error.message}`);
    }
};

/**
 * Sync payment status with booking status
 * @param {string} paymentId - The payment ID
 * @param {string} newPaymentStatus - The new payment status
 * @returns {Promise<Object>} - Returns updated booking data
 */
export const syncPaymentStatusToBooking = async (paymentId, newPaymentStatus) => {
    try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new Error("Payment not found");
        }

        let bookingStatus = "Pending";

        if (newPaymentStatus === "completed") {
            bookingStatus = "Confirmed";
        } else if (newPaymentStatus === "refunded" || newPaymentStatus === "cancelled") {
            bookingStatus = "Cancelled";
        } else if (newPaymentStatus === "failed") {
            bookingStatus = "Pending";
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            payment.bookingId,
            { status: bookingStatus },
            { new: true }
        );

        return updatedBooking;
    } catch (error) {
        throw new Error(`Failed to sync payment to booking: ${error.message}`);
    }
};

/**
 * Get payment status for a booking
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Object>} - Returns payment summary
 */
export const getBookingPaymentStatus = async (bookingId) => {
    try {
        const payments = await Payment.find({ bookingId });
        
        if (payments.length === 0) {
            return { 
                hasPayment: false, 
                status: "No payment yet",
                payments: [] 
            };
        }

        const latestPayment = payments[0]; // sorted by createdAt
        const completedPayment = payments.find(p => p.paymentStatus === "completed");

        return {
            hasPayment: true,
            latestPaymentStatus: latestPayment.paymentStatus,
            isPaymentCompleted: !!completedPayment,
            totalPaymentRecords: payments.length,
            payments: payments,
            latestPayment: latestPayment
        };
    } catch (error) {
        throw new Error(`Failed to get payment status: ${error.message}`);
    }
};

/**
 * Generate a unique booking reference for payment tracking
 * @param {string} bookingId - The booking ID
 * @returns {string} - The generated reference
 */
export const generateBookingReference = (bookingId) => {
    return `BK-${bookingId.toString().slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
};

/**
 * Validate transaction ID uniqueness
 * @param {string} transactionId - The transaction ID to check
 * @returns {Promise<boolean>} - True if unique, false if duplicate
 */
export const isTransactionIdUnique = async (transactionId) => {
    try {
        if (!transactionId) return true;
        
        const existingPayment = await Payment.findOne({ transactionId });
        return !existingPayment;
    } catch (error) {
        throw new Error(`Failed to validate transaction ID: ${error.message}`);
    }
};
