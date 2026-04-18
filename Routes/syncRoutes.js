import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import {
  validateBookingForPayment,
  getPaymentsByBookingId,
  getBookingPaymentStatus,
  checkExistingPaymentForBooking,
} from "../services/bookingPaymentSyncService.js";

const router = express.Router();

/**
 * Get payment status for a specific booking
 * Route: GET /api/sync/booking/:bookingId/payment-status
 * Access: Customer (own booking) or Admin
 */
router.get("/booking/:bookingId/payment-status", protect, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check if user is owner or admin
    const isOwner = booking.userId.toString() === req.user.id.toString();
    const isAdminUser = req.user.role === "admin";

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Cannot access this booking",
      });
    }

    // Get payment status
    const paymentStatus = await getBookingPaymentStatus(bookingId);

    res.status(200).json({
      success: true,
      data: {
        bookingId,
        bookingStatus: booking.status,
        paymentInfo: paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get all payments for a booking
 * Route: GET /api/sync/booking/:bookingId/payments
 * Access: Customer (own booking) or Admin
 */
router.get("/booking/:bookingId/payments", protect, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check if user is owner or admin
    const isOwner = booking.userId.toString() === req.user.id.toString();
    const isAdminUser = req.user.role === "admin";

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Cannot access this booking",
      });
    }

    // Get all payments
    const payments = await getPaymentsByBookingId(bookingId);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Validate payment can be created for booking
 * Route: POST /api/sync/validate-booking/:bookingId
 * Access: Customer (own booking)
 */
router.post("/validate-booking/:bookingId", protect, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const validation = await validateBookingForPayment(bookingId, req.user.id);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking is valid for payment creation",
      data: {
        bookingId,
        totalPrice: validation.booking.totalPrice,
        bookingStatus: validation.booking.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get booking details with payment info (Admin only)
 * Route: GET /api/sync/admin/booking/:bookingId/full
 * Access: Admin
 */
router.get("/admin/booking/:bookingId/full", protect, isAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstName lastName email phone")
      .populate("hotelId", "name city")
      .populate("packageId", "title");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const payments = await Payment.find({ bookingId });

    res.status(200).json({
      success: true,
      data: {
        booking,
        payments,
        summary: {
          totalPayments: payments.length,
          totalAmountPaid: payments
            .filter((p) => p.paymentStatus === "completed")
            .reduce((sum, p) => sum + p.amount, 0),
          paymentStatus: payments.length > 0
            ? payments[0].paymentStatus
            : "no_payment",
          bookingStatus: booking.status,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Admin function to sync a payment to booking status
 * Route: POST /api/sync/admin/sync-status
 * Access: Admin
 * Body: { paymentId, bookingId, action }
 */
router.post("/admin/sync-status", protect, isAdmin, async (req, res) => {
  try {
    const { paymentId, bookingId, action } = req.body;

    if (!paymentId || !bookingId || !action) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: paymentId, bookingId, action",
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Map payment status to booking status
    const statusMap = {
      complete: "Confirmed",
      cancel: "Cancelled",
      pending: "Pending",
    };

    const newBookingStatus = statusMap[action];
    if (!newBookingStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use: complete, cancel, or pending",
      });
    }

    // Update both
    payment.paymentStatus = action === "complete" ? "completed" : action;
    await payment.save();

    booking.status = newBookingStatus;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment and Booking status synchronized",
      data: {
        bookingId,
        paymentId,
        newBookingStatus,
        newPaymentStatus: payment.paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
