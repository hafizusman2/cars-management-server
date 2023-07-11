const express = require("express");
require("dotenv").config();
require("colors");
// const session = require("express-session");
// const rateLimit = require("express-rate-limit");
// const bodyParser = require("body-parser");
// const path = require("path");
const cors = require("cors");
const UserRouter = require("./routes/userRoutes");
const AuthorizationRouter = require("./routes/auth");
const carCategoriesRouter = require("./routes/carCategoriesRoutes");
const carsRouter = require("./routes/carRoutes");
const port = process.env.PORT || 5000;
const connectDB = require("./config/db");
const xss = require("xss");
const html = xss('<script>alert("xss");</script>');

const app = express();
const router = express.Router();
const config = require("./config/config");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length, total-records");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.res.sendStatus(200);
  } else {
    return next();
  }
});

router.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    return res.status(500).send({
      data: "Invalid data",
      error: error,
    });
  } else {
    next();
  }
});

router.get(config.app.apiPath, async function (req, res) {
  res.json(`${config.app.title} APIs`);
});

UserRouter.routesConfig(app, router);
AuthorizationRouter.routesConfig(app, router);
carCategoriesRouter.routesConfig(app, router);
carsRouter.routesConfig(app, router);

app.use("/", router);
app.get("/welcome", (req, res) => {
  res.send("Welcome to the Car Management APIs!");
});

app.get("*", (req, res) => {
  res.status(404).json({ message: "Page Not Found - You're Lost" });
});

app.listen(config.app.port, async () => {
  try {
    await connectDB();
    console.log(`Server running on port ${port}`);
  } catch (err) {
    console.log("server con err");
    console.log(err.message);
  }
});
