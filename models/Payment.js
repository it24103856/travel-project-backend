import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        index: true 
    },
    bookingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Booking", 
        required: true,
        index: true 
    },
    bookingReference: {
        type: String,
        default: function() {
            return `BK-${this.bookingId.toString().slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
        }
    },
    amount: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    currency: { 
        type: String, 
        default: "LKR" 
    },
    paymentMethod: { 
        type: String, 
        enum: ["card", "bank_transfer", "crypto"], 
        required: true 
    },


    transactionId: { 
        type: String,
        default: null,
        unique: true,
        sparse: true,
        index: true
    },
    // ─────────────────────────────────────────────────────────────────────────

    paymentStatus: { 
        type: String, 
        enum: ["pending", "processing", "completed", "failed", "refunded", "cancel_requested"], 
        default: "pending" 
    },
    receiptUrl: { 
        type: String 
    },
    paymentDetails: {
        customerName: String,
        bankName:    String,
        paymentDate: Date,
        paidAmount:  Number,
        currency:    String,
        remark:      String
    },
    aiVerification: {
        isReceipt:         Boolean,
        paymentConfirmed:  Boolean,
        extractedAmount:   Number,
        extractedCurrency: String,
        extractedPayerName: String,
        transactionId:     String,
        paymentDate:       String,
        confidence:        Number,
        reason:            String,
        verifiedAt:        Date,
        verifiedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    },
    metadata: { 
        adminNotes:   String, 
        cancelReason: String 
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;