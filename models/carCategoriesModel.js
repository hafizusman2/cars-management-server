const mongoose = require("mongoose");

const carCategoriesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a Car Category Name"],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add a User"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarCategories", carCategoriesSchema);
