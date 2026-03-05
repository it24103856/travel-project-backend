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
        ref: "Order",
        required: true,
        index: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"] 
    },
    currency: {
        type: String,
        default: "LKR",
        uppercase: true,
        enum: ["LKR", "USD", "EUR", "GBP"], 
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["card", "bank_transfer",  "crypto"], 
        required: true
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true 
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "processing", "completed", "failed", "refunded", "partially_refunded"],
        default: "pending",
        index: true 
    },
    receiptUrl: {
        type: String
    },
    paymentDetails: {
        type: Object,
        default: {} 
    },
    refundDetails: [{ 
        amount: Number,
        reason: String,
        transactionId: String,
        refundedAt: {
            type: Date,
            default: Date.now
        }
    }],
    paidAt: { 
        type: Date
    },
    metadata: { 
        ipAddress: String,
        userAgent: String,
        gatewayResponse: Object
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});


paymentSchema.virtual('isSuccessful').get(function() {
    return this.paymentStatus === 'completed';
});

paymentSchema.virtual('isFailed').get(function() {
    
    return this.paymentStatus === 'failed';

})

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;