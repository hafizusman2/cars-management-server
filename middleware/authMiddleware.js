const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const secret = config.jwt.secret;
const apiResponse = require("../common/api.response");

exports.validJWTNeeded = (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, secret);
      req.user = decoded;

      return next();
    } catch (err) {
      return apiResponse.fail(res, "Token invalid or expire", 401);
    }
  } else {
    return apiResponse.fail(res, "Token not provided", 401);
  }
};

exports.blockApis = (req, res, next) => {
  return apiResponse.fail(res, "Api blocked", 403);
};

exports.validStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return apiResponse.fail(res, "User not found", 401);
    if (user.status == 0) {
      return apiResponse.fail(res, "inactive", 403);
    } else {
      return next();
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 401);
  }
};

/**
 * How To Call Method
    router.get('/route', [
      authMiddleware.hasAccess(['admin', 'customer', 'seller']),
      controller.controllerAlpha
    ])
 */
exports.hasAccess =
  (requiredRoleRights = null) =>
  async (req, res, next) => {
    try {
      if (!req.user.role) throw new Error();

      if (!requiredRoleRights.includes(req.user.role)) throw new Error();
      if (req.user.role === config.userRole.ADMIN && !req.user.admin)
        throw new Error();
      next();
    } catch (error) {
      return apiResponse.fail(res, "", 403);
    }
  };
