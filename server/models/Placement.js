const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    packageOffered: {
      type: Number,
      default: 0,
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate placements — same student can't be placed twice in same company
placementSchema.index({ student: 1, company: 1 }, { unique: true });
placementSchema.index({ company: 1 });

module.exports = mongoose.model("Placement", placementSchema);
