const mongoose = require("mongoose");
const config = require("../config/config");
const apiResponse = require("../common/api.response");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.app.mongoUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(error);
    apiResponse.fail(res, error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
