const Validator = require("validatorjs");
const User = require("../models/userModel");
const Car = require("../models/carModel");
const CarCategories = require("../models/carCategoriesModel");
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");
const config = require("../config/config");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../config/nodemailer");

exports.register = async (req, res) => {
  const validation = new Validator(req.body, {
    name: "required|string|min:3",
    email: "required|email",
    city: "required|string|min:3",
    // password: "required|string|min:6",
    // role: "required|string",
    status: "numeric",
  });

  validation.fails(function () {
    apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const params = req.body;
      //throws error if user already exists
      const userExists = await User.findOne({ email: params.email });
      if (userExists) {
        return apiResponse.fail(res, "User already exists", 401);
      }

      //generate random password
      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await helper.setPassword(password);
      params.password = hashedPassword;

      if (req.file) {
        const result = await cloudinary.uploadImage(req.file.path);
        params.profileImage = {
          image: result.secure_url,
          imageId: result.public_id,
        };
      }

      const user = await User.create(params);

      // const token = helper.createJwtToken(user);
      const text = `Welcome to the Cars Management System! \n\n Email: ${user.email} \n Password: ${password} \n Please Login with above credentials below link \n ${config.app.clientURL}/login`;
      await sendEmail(
        user.email,
        "Welcome to the Cars Management System!",
        text
      );

      apiResponse.success(res, req, user);
    } catch (err) {
      apiResponse.fail(res, err.message, 500);
      console.log(err.message);
    }
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    apiResponse.success(res, req, user);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.allStats = async (req, res) => {
  try {
    const totalCategories = await CarCategories.countDocuments();
    const totalCars = await Car.countDocuments();
    const totalUsers = await User.countDocuments();

    const stats = {
      totalCategories,
      totalCars,
      totalUsers,
    };
    return apiResponse.success(res, req, stats);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};
