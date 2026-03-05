import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Auth ඇත්නම් පමණක්
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    roomType: { type: String, required: true },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);