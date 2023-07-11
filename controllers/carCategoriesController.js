const Validator = require("validatorjs");
const CarCategory = require("../models/carCategoriesModel");
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");

exports.addCarCategory = async (req, res) => {
  const rules = {
    name: ["required", "string", "max:50"],
  };
  const validation = new Validator(req.body, rules);
  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });
  validation.passes(async function () {
    try {
      const params = req.body;
      params.name = params.name.trim();
      params.name = params.name.toLowerCase();
      const name = params.name;
      const existingCarCategory = await CarCategory.findOne({ name });

      if (existingCarCategory) {
        return apiResponse.fail(res, "Car category already exists", 400);
      }

      const addedBy = req.user.id;
      const carCategory = new CarCategory({ name, addedBy });
      const result = await carCategory.save();
      apiResponse.success(res, req, result);
    } catch (err) {
      apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.getCarCategoryById = async (req, res) => {
  const validation = new Validator(req.params, {
    id: [`regex:${helper.objectIdRegex}`],
  });
  validation.fails(() => {
    return apiResponse.fail(res, validation.errors.all(), 400);
  });
  validation.passes(async () => {
    try {
      const category = await CarCategory.findById(req.params.id);
      if (!category) {
        return apiResponse.fail(res, "Car category not found", 404);
      }
      return apiResponse.success(res, req, category);
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};

exports.getCarCategories = async (req, res) => {
  try {
    const categories = await CarCategory.find();
    if (!categories) {
      return apiResponse.fail(res, "Car categories not found", 404);
    }
    return apiResponse.success(res, req, categories);
  } catch (error) {
    return apiResponse.fail(res, error.message, 500);
  }
};

exports.updateCarCategory = async (req, res) => {
  const paramsValidation = new Validator(req.params, {
    id: [`regex:${helper.objectIdRegex}`],
  });
  paramsValidation.fails(() => {
    return apiResponse.fail(res, paramsValidation.errors.all(), 400);
  });
  const validation = new Validator(req.body, {
    name: ["required", "string", "max:50"],
  });
  validation.fails(() => {
    return apiResponse.fail(res, validation.errors.all(), 400);
  });
  validation.passes(async () => {
    try {
      const existingCarCategory = await CarCategory.findById(req.params.id);
      if (!existingCarCategory) {
        return apiResponse.fail(res, "Car category not found", 404);
      }
      const params = req.body;
      params.name = params.name.trim();
      params.name = params.name.toLowerCase();
      const name = params.name;
      const updateCarCategory = await CarCategory.findByIdAndUpdate(
        req.params.id,
        { name, addedBy: req.user.id },
        { new: true }
      );

      return apiResponse.success(res, req, updateCarCategory);
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};

exports.deleteCarCategory = async (req, res) => {
  const validation = new Validator(req.params, {
    id: [`regex:${helper.objectIdRegex}`],
  });
  validation.fails(() => {
    return apiResponse.fail(res, validation.errors.all(), 400);
  });
  validation.passes(async () => {
    try {
      const deleteCarCategory = await CarCategory.findById(req.params.id);

      if (!deleteCarCategory) {
        return apiResponse.fail(res, "Car category not found", 404);
      }
      const deletedCarCategory = await CarCategory.findByIdAndDelete(
        req.params.id
      );
      return apiResponse.success(res, req, deletedCarCategory);
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};
