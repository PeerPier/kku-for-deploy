// server/models/view.js
const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    total_reads: {
      type: Number,
      default: 0
    },
    user_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  {
    timestamps: true
  }
);

ViewSchema.index({ blog: 1, month: 1, year: 1 }, { unique: true });

const View = mongoose.model("View", ViewSchema);

module.exports = View;