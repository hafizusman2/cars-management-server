const Validator = require("validatorjs");
const User = require("../models/userModel");
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");
const config = require("../config/config");
const sendEmail = require("../config/nodemailer");
const jwt = require("jsonwebtoken");

async function login_action(req, res, user) {
  // Verify Password
  try {
    await helper.matchPassword(req.body.password, user.password);
  } catch (err) {
    return apiResponse.fail(res, err, 401);
  }

  //Verify Status
  if (user.status == 0) {
    return apiResponse.fail(res, "inactive", 403);
  } else {
    try {
      // Create Token
      const token = helper.createJwtToken(user);
      apiResponse.success(res, req, { ...user._doc, token });
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  }
}

exports.login = async (req, res) => {
  // Validation
  const validation = new Validator(req.body, {
    email: "required|email",
    password: "required",
  });
  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });
  validation.passes(async function () {
    try {
      const params = req.body;
      const email = params.email;
      // Verify Email address
      const user = await User.findOne({ email });
      if (!user) {
        return apiResponse.fail(res, "Email address not found", 401);
      }
      // Verify Password and Status
      if (user) {
        return login_action(req, res, user);
      }
    } catch (err) {
      apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.forgetPassword = async (req, res) => {
  const validation = new Validator(req.body, {
    email: "required|email",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });
  validation.passes(async function () {
    try {
      const { email } = req.body;
      // Verify Email address
      const user = await User.findOne({
        email,
      });
      if (!user) {
        return apiResponse.fail(res, "Email address not found", 401);
      }

      // Generate Token
      const token = helper.createJwtToken(
        user,
        config.resetPassword.secret,
        config.resetPassword.expirationInMinutes
      );
      let link = `${config.app.clientURL}/password-reset?id=${user._id}&token=${token}`;

      await sendEmail(user.email, "Password reset", link);
      await user.updateOne({ resetLink: token });
      apiResponse.success(res, req, { message: "Email sent", url: link });
    } catch (err) {
      apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.resetPassword = async (req, res) => {
  const paramsValidation = new Validator(req.params, {
    id: ["required", `regex:${helper.objectIdRegex}`],
    token: "required",
  });

  const bodyValidation = new Validator(req.body, {
    password: "required",
  });

  paramsValidation.fails(function () {
    return apiResponse.fail(res, paramsValidation.errors);
  });
  bodyValidation.fails(function () {
    return apiResponse.fail(res, bodyValidation.errors);
  });

  paramsValidation.passes(async function () {
    bodyValidation.passes(async function () {
      try {
        const { id, token } = req.params;
        const { password } = req.body;
        // Verify Token
        const user = await User.findOne({
          _id: id,
          resetLink: token,
        });
        if (!user) {
          return apiResponse.fail(res, "Invalid token", 401);
        }
        // Verify Token Expiration
        const decoded = jwt.verify(token, config.resetPassword.secret);
        if (decoded.exp < Date.now() / 1000) {
          return apiResponse.fail(res, "Token expired", 401);
        }
        // Update Password
        user.password = password;
        user.resetLink = "";
        //hash password
        user.password = await helper.setPassword(user.password);
        await user.save();
        apiResponse.success(res, req, "Password updated");
      } catch (err) {
        apiResponse.fail(res, err.message, 500);
      }
    });
  });
};
