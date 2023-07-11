const config = require("../config/config");
const authMiddleware = require("../middleware/authMiddleware");
const carController = require("../controllers/carController");
const { assetUpload } = require("../config/multer");

exports.routesConfig = function (app, router) {
  const url = `${config.app.apiPath}car`;

  router.get(url + "/", [carController.allCars]);

  router.get(url + "/:id", [carController.getCarById]);

  router.get(url + "/reg-no/:regNo", [carController.getCarByRegNo]);

  router.post(url + "/", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    assetUpload.fields([{ name: "assets", maxCount: 20 }]),
    carController.addCar,
  ]);

  router.patch(url + "/:id", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    assetUpload.fields([{ name: "assets", maxCount: 20 }]),
    carController.updateCar,
  ]);

  router.delete(url + "/:id", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    carController.deleteCar,
  ]);
};
