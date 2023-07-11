const config = require("../config/config");
const authMiddleware = require("../middleware/authMiddleware");
const carCategoriesController = require("../controllers/carCategoriesController");

exports.routesConfig = function (app, router) {
  const url = `${config.app.apiPath}car-categories`;

  router.get(url + "/", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    carCategoriesController.getCarCategories,
  ]);

  router.get(url + "/:id", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    carCategoriesController.getCarCategoryById,
  ]);

  router.post(url + "/", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    carCategoriesController.addCarCategory,
  ]);

  router.patch(url + "/:id", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    carCategoriesController.updateCarCategory,
  ]);

  router.delete(url + "/:id", [
    authMiddleware.validJWTNeeded,
    authMiddleware.validStatus,
    carCategoriesController.deleteCarCategory,
  ]);
};
