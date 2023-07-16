const Validator = require("validatorjs");
const User = require("../models/userModel");
const Car = require("../models/carModel");
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");
const cloudinary = require("../config/cloudinary");

exports.addCar = async (req, res) => {
  const carData = req.body;

  const rules = {
    regNo: ["required", "string", "max:17"],
    make: ["required", "string", "max:50"],
    model: ["required", "string", "max:50"],
    year: ["required", "numeric", "min:1900", "max:2100"],
    color: ["required", "string", "max:50"],
    manufacturer: ["required", "string", "max:50"],
    category: ["required", `regex:${helper.objectIdRegex}`],
    title: ["required", "string", "max:50"],
    price: ["required", "numeric"],
    active: "boolean",
    // addedBy: ["required", `regex:${helper.objectIdRegex}`],
  };
  const validation = new Validator(carData, rules);
  if (validation.fails()) {
    return apiResponse.fail(res, validation.errors.all(), 400);
  }
  validation.passes(async () => {
    try {
      const existingCar = await Car.findOne({ regNo: carData.regNo });
      if (existingCar) {
        return apiResponse.fail(res, "Car already exists", 400);
      }
      // const user = await User.findById(carData.addedBy);
      // if (!user) {
      //   return apiResponse.fail(res, "User not found", 404);
      // }

      // if (user.status == 0)
      //   return apiResponse.fail(res, "User is inactive", 400);

      carData.addedBy = req.user.id;

      if (req.files.assets) {
        carData.assets = [];
        for (let i = 0; i < req.files.assets.length; i++) {
          const result = await cloudinary.uploadImage(req.files.assets[i].path);
          carData.assets.push({
            asset: result.secure_url,
            assetId: result.public_id,
          });
        }
      }

      const car = await Car.create(carData);
      return apiResponse.success(res, req, car);
    } catch (error) {
      console.log(error);
      return apiResponse.fail(res, error.message, 500);
    }
  });
};

exports.updateCar = async (req, res) => {
  const paramsValidation = new Validator(req.params, {
    id: [`regex:${helper.objectIdRegex}`],
  });
  paramsValidation.fails(() => {
    return apiResponse.fail(res, paramsValidation.errors.all(), 400);
  });
  const carData = req.body;

  const rules = {
    regNo: ["string", "max:17"],
    make: ["string", "max:50"],
    model: ["string", "max:50"],
    year: ["numeric", "min:1900", "max:2100"],
    color: ["string", "max:50"],
    manufacturer: ["string", "max:50"],
    category: ["required", `regex:${helper.objectIdRegex}`],
    title: ["string", "max:50"],
    price: ["numeric"],
    active: "boolean",
    // addedBy: [`regex:${helper.objectIdRegex}`],
  };
  const bodyValidation = new Validator(carData, rules);

  bodyValidation.fails(() => {
    return apiResponse.fail(res, bodyValidation.errors.all(), 400);
  });

  paramsValidation.passes(async () => {
    bodyValidation.passes(async () => {
      try {
        const car = await Car.findById(req.params.id);
        if (!car) return apiResponse.fail(res, "Car not found", 404);

        const existingCar = await Car.findOne({ regNo: carData.regNo });
        if (existingCar) {
          return apiResponse.fail(res, "Car already exists", 400);
        }
        // const user = await User.findById(carData.addedBy);
        // if (!user) {
        //   return apiResponse.fail(res, "User not found", 404);
        // }

        // if (user.status == 0)
        //   return apiResponse.fail(res, "User is inactive", 400);
        // if (car.addedBy != req.user.id)
        //   return apiResponse.fail(res, "You are not authorized", 400);

        const oldImages = car.assets;
        if (typeof req.body.assets === "string") {
          req.body.assets = [req.body.assets];
        }
        const retainImages = req.body.assets
          ?.map((asset) => {
            let found = oldImages?.find((oldAsset) => oldAsset.asset === asset);
            if (found) return found;
          })
          .filter((asset) => asset);
        const deletedImages = oldImages?.filter((oldAsset) => {
          let found = retainImages?.find(
            (asset) => asset.asset === oldAsset.asset
          );
          if (!found) return oldAsset;
        });
        for (let i = 0; i < deletedImages?.length; i++) {
          await cloudinary.deleteImage(deletedImages[i].assetId);
        }
        if (retainImages) carData.assets = retainImages ?? [];

        if (req.files.assets) {
          carData.assets = carData.assets ?? [];
          for (let i = 0; i < req.files.assets.length; i++) {
            const result = await cloudinary.uploadImage(
              req.files.assets[i].path
            );

            carData.assets.push({
              asset: result.secure_url,
              assetId: result.public_id,
            });
          }
        }

        const updatedCar = await Car.findByIdAndUpdate(req.params.id, carData, {
          new: true,
        });
        return apiResponse.success(res, req, updatedCar);
      } catch (error) {
        console.log(error);
        return apiResponse.fail(res, error.message, 500);
      }
    });
  });
};

exports.getCarById = async (req, res) => {
  const validation = new Validator(req.params, {
    id: [`regex:${helper.objectIdRegex}`],
  });
  validation.fails(() => {
    return apiResponse.fail(res, validation.errors.all(), 400);
  });
  validation.passes(async () => {
    try {
      const car = await Car.findById(req.params.id);
      if (!car) {
        return apiResponse.fail(res, "Car not found", 404);
      }
      //   if (
      //     req.user.id !== car.addedBy.toString()
      //   ) {
      //     throw new Error("You are not authorized to view this car");
      //   }
      return apiResponse.success(res, req, car);
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};

exports.allCars = async (req, res) => {
  const paramsValidation = new Validator(req.query, {
    limit: ["numeric"],
    page: ["numeric", "min:1"],
    search: "string",
    sort: ["string", "in:asc,dsc"],
    make: "string",
    model: "string",
    color: "string",
  });

  if (paramsValidation.fails()) {
    return apiResponse.fail(res, paramsValidation.errors.all(), 400);
  }

  paramsValidation.passes(async () => {
    try {
      let params = {};
      if (!req.query.page) req.query.page = 1;
      if (!req.query.limit) req.query.limit = 10;
      if (req.query.limit && req.query.page) {
        params = helper.get_pagination_params(req.query);
      }
      const sortParam = req.query.sort ? req.query.sort : "asc";
      let queryParams = req.query;
      let removeFields = ["limit", "page", "sort"];
      removeFields.forEach((param) => delete queryParams[param]);

      function makeCaseInsensitive(params) {
        params = params.replace(/\s/g, "");
        params = params.replace(/,/g, "|");
        return new RegExp(params, "i");
      }
      const filters = {};
      if (queryParams.make)
        filters.make = makeCaseInsensitive(queryParams.make);
      if (queryParams.model)
        filters.model = makeCaseInsensitive(queryParams.model);
      if (queryParams.color)
        filters.color = makeCaseInsensitive(queryParams.color);

      const pipeline = [
        { $match: filters },
        {
          $lookup: {
            from: "carcategories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
      ];

      // Search in CarCategories collection
      if (queryParams.search) {
        // Match stage
        const matchStage = {
          $match: {
            $or: [
              { title: { $regex: queryParams.search || "", $options: "i" } },
              { regNo: { $regex: queryParams.search || "", $options: "i" } },
              { make: { $regex: queryParams.search || "", $options: "i" } },
              { model: { $regex: queryParams.search || "", $options: "i" } },
              { color: { $regex: queryParams.search || "", $options: "i" } },
              {
                manufacturer: {
                  $regex: queryParams.search || "",
                  $options: "i",
                },
              },
              { price: { $regex: queryParams.search || "", $options: "i" } },
              { year: { $regex: queryParams.search || "", $options: "i" } },
              {
                "category.name": {
                  $regex: queryParams.search || "",
                  $options: "i",
                },
              },
            ],
          },
        };
        pipeline.push(matchStage);
      }

      // Sort stage
      const sortOrder = sortParam === "dsc" ? -1 : 1;
      const sortStage = {
        $sort: {
          createdAt: sortOrder,
        },
      };
      pipeline.push(sortStage);

      // Skip and limit stage
      const skipStage = {
        $skip: params.offset,
      };
      pipeline.push(skipStage);

      const limitStage = {
        $limit: params.limit,
      };
      pipeline.push(limitStage);

      // Count stage
      const countPipeline = [...pipeline];
      const countStage = {
        $count: "totalCars",
      };
      countPipeline.push(countStage);

      const cars = await Car.aggregate(pipeline);
      const totalCarsResult = await Car.aggregate(countPipeline);
      const totalCars =
        totalCarsResult.length > 0 ? totalCarsResult[0].totalCars : 0;

      return apiResponse.pagination(
        res,
        req,
        { totalCars, count: cars.length, cars },
        totalCars
      );
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};

exports.deleteCar = async (req, res) => {
  const validation = new Validator(req.params, {
    id: [`regex:${helper.objectIdRegex}`],
  });
  validation.fails(() => {
    return apiResponse.fail(res, validation.errors.all(), 400);
  });
  validation.passes(async () => {
    try {
      const deleteCar = await Car.findById(req.params.id);
      if (!deleteCar) return apiResponse.fail(res, "Car not found", 404);
      //   if (
      //     deleteCar.addedBy.toString() != req.user.id
      //   )
      //     return apiResponse.fail(res, "You are not authorized", 400);
      const car = await Car.findByIdAndDelete(req.params.id);

      if (car && car.assets) {
        for (let i = 0; i < car.assets.length; i++) {
          await cloudinary.deleteImage(car.assets[i].assetId);
        }
      }
      return apiResponse.success(res, req, car);
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};

exports.getCarByRegNo = async (req, res) => {
  const validation = new Validator(req.params, {
    regNo: ["required"],
  });
  validation.fails(() => {
    return apiResponse.fail(res, validation.errors.all(), 400);
  });
  validation.passes(async () => {
    try {
      const car = await Car.findOne({ regNo: req.params.regNo });
      if (!car) return apiResponse.fail(res, "Car not found", 404);
      return apiResponse.success(res, req, car);
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};
