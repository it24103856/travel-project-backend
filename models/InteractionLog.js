import mongoose from "mongoose";

const interactionLogSchema = new mongoose.Schema(
  {
    user_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    package_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Package",
      required: true,
    },
    action: {
      type:     String,
      enum:     ["view", "rating", "booking"],
      required: true,
    },
    rating: {
      type:    Number,
      min:     1,
      max:     5,
      default: null,   // only populated for "rating" action
    },
    view_duration: {
      type:    Number,
      default: null,   // seconds on page, only populated for "view" action
    },
  },
  { timestamps: true }
);

export default mongoose.model("InteractionLog", interactionLogSchema);