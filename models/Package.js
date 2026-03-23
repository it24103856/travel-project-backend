import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    mainImage: { type: String },
    itinerary: { type: String },
    mapUrl: { type: String },
    destinations: { type: String },
    transport: { type: String },
    gallery: { type: String },
    reviews: { type: String },
    faqs: { type: String },
    tips: { type: String },
    
    hotels: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Hotel" 
    }],
    
    driver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Driver" 
    }
}, { timestamps: true }); 
export default mongoose.model("Package", packageSchema);