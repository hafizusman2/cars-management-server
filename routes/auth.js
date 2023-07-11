const config = require("../config/config");
const authController = require("../controllers/authorization");

exports.routesConfig = function (app, router) {
  const url = `${config.app.apiPath}auth`;
  router.post(url, [authController.login]);

  router.post(url + "/forget-password", [authController.forgetPassword]);

  router.post(url + "/reset-password/:id/:token", [
    authController.resetPassword,
  ]);
};
