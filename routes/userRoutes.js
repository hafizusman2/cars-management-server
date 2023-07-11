const config = require("../config/config");
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const { imageUpload } = require("../config/multer");

exports.routesConfig = function (app, router) {
  const url = `${config.app.apiPath}user`;
  router.post(url + "/register", [
    imageUpload.single("image"),
    userController.register,
  ]);

  router.get(url + "/me", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    userController.getMe,
  ]);

  // router.get(url + "/stats", [
  //   authMiddleware.validJWTNeeded,
  //   authMiddleware.validStatus,
  //   userController.allStats,
  // ]);
};
