const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a Name"],
    },
    email: {
      type: String,
      required: [true, "Please add an Email"],
      unique: true,
    },

    city: { required: [true, "Please add a City"], type: String },
    password: {
      type: String,
      required: [true, "Please add a Password"],
    },
    status: {
      type: Number,
      default: 1,
    },
    profileImage: {
      image: { type: String },
      imageId: { type: String },
      type: Object,
    },
    resetLink: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
