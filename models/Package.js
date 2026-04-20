import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    time: { type: String },
    task: { type: String }
});

const itinerarySchema = new mongoose.Schema({
    day_no: { type: Number  },
    title: { type: String },
    activities: [activitySchema]
});

const faqSchema = new mongoose.Schema({
    question: { type: String },
    answer: { type: String}
});

const travellerTipSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String }
});

const packageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
        type: String,
        required: true,
        enum: [
            "Colombo", "Kandy", "Galle", "Jaffna", "Anuradhapura",
            "Polonnaruwa", "Sigiriya", "Ella", "Nuwara Eliya", "Trincomalee",
            "Batticaloa", "Hambantota", "Mirissa", "Hikkaduwa", "Arugam Bay",
            "Yala", "Wilpattu", "Udawalawe", "Dambulla", "Matara",
            "Bentota", "Negombo", "Ratnapura", "Badulla", "Ampara",
            "Multi-location"
        ]
    },

    // ── Changed: added enum values ─────────────────────────────────────────────
    categories: {
        type: [String],
        enum: ["adventure", "wildlife", "historical", "cultural", "beach", "wellness", "eco", "family"],
        default: []
    },

    price: { type: Number, required: true },
    no_of_days: { type: Number, required: true },

    transport: {
        type: [String],
        default: []
    },

    // ── New: needed for hard filter (capacity) ─────────────────────────────────
    min_group_size: { type: Number, default: 1 },
    max_group_size: { type: Number, default: 20 },

    // ── New: needed for weather matching ───────────────────────────────────────
    weather: {
        type: [String],
        enum: ["sunny", "tropical", "humid", "cool", "dry", "rainy"],
        default: []
    },

    // ── New: links package activities to User.interests ────────────────────────
    interests: {
        type: [String],
        enum: [
            "hiking", "surfing", "nature_photography", "wildlife_spotting",
            "camping", "diving", "paddling_boats", "stargazing",
            "cycling", "rock_climbing", "bird_watching", "cultural_tours"
        ],
        default: []
    },

    itineraries: [itinerarySchema],
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Destination" }],
    included_hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
    gallery: { type: [String], default: [] },
    faqs: [faqSchema],
    traveller_tips: [travellerTipSchema]
});

export default mongoose.model("Package", packageSchema);