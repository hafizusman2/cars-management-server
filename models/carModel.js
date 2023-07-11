const mongoose = require("mongoose");

const carSchema = mongoose.Schema(
  {
    regNo: {
      type: String,
      required: [true, "Please add a Registration Number"],
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Please add a Title"],
    },
    make: {
      type: String,
      required: [true, "Please add a Make"],
    },
    model: {
      type: String,
      required: [true, "Please add a Model"],
    },
    color: {
      type: String,
      required: [true, "Please add a Color"],
    },
    year: {
      type: Number,
      required: [true, "Please add a Year"],
    },

    manufacturer: {
      type: String,
      required: [true, "Please add a Manufacturer"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCategories",
      required: [true, "Please add a Category"],
    },

    assets: [
      {
        type: Object,
        asset: { type: String },
        assetId: { type: String },
      },
    ],
    price: {
      type: Number,
      required: [true, "Please add a Price"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);
