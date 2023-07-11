require("dotenv").config();

module.exports = {
  env: process.env.NODE_ENV || "production",
  app: {
    title: process.env.APP_TITLE || "Cars Management System",
    port: process.env.PORT || "5000",
    backendURL:
      process.env.BACKEND_URL || "https://cars-management-server.herokuapp.com",
    clientURL: process.env.CLIENT_URL || "https://cars-management.vercel.app",
    apiPath: process.env.API_PATH || "/api/v1/",
    mongoUrl:
      process.env.MONGO_URL ||
      "mongodb+srv://malikkusman:nZ6L7x3srgvJJnbx@cluster0.l6iio.mongodb.net/CarsManagement?retryWrites=true&w=majority",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "cars-management-secret-key",
    expirationInDays: process.env.JWT_EXPIRATION_IN_DAYS || "30d",
  },
  salt: process.env.SALT || 10,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dc2ifpt43",
    api_key: process.env.CLOUDINARY_API_KEY || "546614171376734",
    api_secret:
      process.env.CLOUDINARY_API_SECRET || "92ez586QncFl7tLtqRTe5JuRM20",
    folder_name: process.env.CLOUDINARY_FOLDER_NAME || "cars-management",
    secure: true,
  },
  nodemailer: {
    host: process.env.HOST || "smtp.gmail.com",
    userEmail: process.env.USER_EMAIL || "usergmdc@gmail.com",
    userPassword: process.env.USER_PASSWORD || "evkfzkcrsgvvmpgn",
    service: process.env.SERVICE || "gmail",
  },

  resetPassword: {
    secret:
      process.env.RESET_PASSWORD_SECRET ||
      "reset-password-secret-key-cars-management",
    expirationInMinutes:
      process.env.RESET_PASSWORD_EXPIRATION_IN_MINUTES || "20m",
  },
};
