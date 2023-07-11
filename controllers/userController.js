const Validator = require("validatorjs");
const User = require("../models/userModel");
const Car = require("../models/carModel");
const CarCategories = require("../models/carCategoriesModel");
const apiResponse = require("../common/api.response");
const helper = require("../common/helper");
const config = require("../config/config");
const cloudinary = require("../config/cloudinary");
const sendEmail = require("../config/nodemailer");

exports.register = async (req, res) => {
  const validation = new Validator(req.body, {
    name: "required|string|min:3",
    email: "required|email",
    city: "required|string|min:3",
    // password: "required|string|min:6",
    // role: "required|string",
    status: "numeric",
  });

  validation.fails(function () {
    apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const params = req.body;
      //throws error if user already exists
      const userExists = await User.findOne({ email: params.email });
      if (userExists) {
        return apiResponse.fail(res, "User already exists", 401);
      }

      //generate random password
      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await helper.setPassword(password);
      params.password = hashedPassword;

      if (req.file) {
        const result = await cloudinary.uploadImage(req.file.path);
        params.profileImage = {
          image: result.secure_url,
          imageId: result.public_id,
        };
      }

      const user = await User.create(params);

      // const token = helper.createJwtToken(user);
      const text = `Welcome to the Cars Management System! \n\n Email: ${user.email} \n Password: ${password} \n Please Login with above credentials below link \n ${config.app.clientURL}/login`;
      await sendEmail(
        user.email,
        "Welcome to the Cars Management System!",
        text
      );

      apiResponse.success(res, req, user);
    } catch (err) {
      apiResponse.fail(res, err.message, 500);
      console.log(err.message);
    }
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    apiResponse.success(res, req, user);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

// exports.allStats = async (req, res) => {
//   try {
//     if (req.user.role === config.userRole.CUSTOMER) {
//       const totalOrders = await Order.find({ customer: req.user.id });
//       const newOrders = await Order.find({
//         customer: req.user.id,
//         status: config.order.status.NEW,
//       });
//       const processedOrders = await Order.find({
//         customer: req.user.id,
//         status: config.order.status.PROCESSED,
//       });
//       const completedOrders = await Order.find({
//         customer: req.user.id,
//         status: config.order.status.COMPLETED,
//       });
//       const dpPaidOrders = await Order.find({
//         customer: req.user.id,
//         status: config.order.status.DP_PAID,
//       });

//       const totalPayments = totalOrders.reduce((acc, order) => {
//         return acc + order.totalPrice;
//       }, 0);

//       const remainingPayments = totalOrders.reduce((acc, order) => {
//         return acc + order.remainingPayment;
//       }, 0);

//       const totalPaidPayments = dpPaidOrders.reduce((acc, order) => {
//         return acc + order.downPayment;
//       }, 0);

//       const stats = {
//         totalOrders: totalOrders.length,
//         newOrders: newOrders.length,
//         processedOrders: processedOrders.length,
//         completedOrders: completedOrders.length,
//         dpPaidOrders: dpPaidOrders.length,
//         totalPayments,
//         remainingPayments,
//         totalPaidPayments,
//       };
//       return apiResponse.success(res, req, stats);
//     }

//     if (req.user.role === config.userRole.SELLER) {
//       const vehicles = await Vehicle.find({ addedBy: req.user.id });
//       const availableVehicles = await Vehicle.find({
//         addedBy: req.user.id,
//         status: config.vehicle.status[0],
//       });
//       const soldVehicles = await Vehicle.find({
//         addedBy: req.user.id,
//         status: config.vehicle.status[1],
//       });
//       const newOrders = await Order.find({
//         sellerId: req.user.id,
//         status: config.order.status.DP_PAID,
//       });
//       const processedOrders = await Order.find({
//         sellerId: req.user.id,
//         status: config.order.status.PROCESSED,
//       });
//       const completedOrders = await Order.find({
//         sellerId: req.user.id,
//         status: config.order.status.COMPLETED,
//       });
//       const paymentsReceived = await Payment.find({
//         sellerId: req.user.id,
//         paymentType: config.userRole.SELLER,
//       });

//       const totalPayments = paymentsReceived.reduce(
//         (total, payment) => total + payment.paymentAmount,
//         0
//       );

//       const stats = {
//         vehicles: vehicles.length,
//         availableVehicles: availableVehicles.length,
//         soldVehicles: soldVehicles.length,
//         newOrders: newOrders.length,
//         processedOrders: processedOrders.length,
//         completedOrders: completedOrders.length,
//         totalPayments,
//       };

//       return apiResponse.success(res, req, stats);
//     }

//     const users = await User.find();
//     const activeUsers = await User.find({ status: 1 });
//     const blockedUsers = await User.find({ status: 0 });
//     const sellers = await User.find({ role: config.userRole.SELLER });
//     const customers = await User.find({ role: config.userRole.CUSTOMER });
//     const admins = await User.find({ role: config.userRole.ADMIN });
//     const vehicles = await Vehicle.find();
//     const availableVehicles = await Vehicle.find({
//       status: config.vehicle.status[0],
//     });
//     const soldVehicles = await Vehicle.find({
//       status: config.vehicle.status[1],
//     });
//     const newOrders = await Order.find({ status: config.order.status.NEW });
//     const dpPaidOrders = await Order.find({
//       status: config.order.status.DP_PAID,
//     });
//     const totalOrders = await Order.find();
//     const processedOrders = await Order.find({
//       status: config.order.status.PROCESSED,
//     });
//     const completedOrders = await Order.find({
//       status: config.order.status.COMPLETED,
//     });
//     const dpPayments = await Order.find({
//       status: config.order.status.DP_PAID,
//     });

//     const dpTotal = dpPayments.reduce(
//       (total, payment) => total + payment.downPayment,
//       0
//     );
//     const remainingPaymentsTotal = totalOrders.reduce(
//       (total, order) => total + order.remainingPayment,
//       0
//     );
//     const totalCustomerPayments = totalOrders.reduce(
//       (total, order) => total + order.totalPrice,
//       0
//     );

//     const totalSellerPaymentsDue = totalOrders.reduce(
//       (total, order) => total + order.vehiclePrice,
//       0
//     );
//     const stats = {
//       users: users.length,
//       activeUsers: activeUsers.length,
//       blockedUsers: blockedUsers.length,
//       sellers: sellers.length,
//       customers: customers.length,
//       admins: admins.length,
//       vehicles: vehicles.length,
//       dpVehicles: dpPaidOrders.length,
//       processedVehicles: processedOrders.length,
//       deliveredVehicles: completedOrders.length,
//       availableVehicles: availableVehicles.length,
//       soldVehicles: soldVehicles.length,
//       newOrders: newOrders.length,
//       totalOrders: totalOrders.length,
//       dpPaidOrders: dpPaidOrders.length,
//       processedOrders: processedOrders.length,
//       completedOrders: completedOrders.length,
//       dpReceivedPayments: dpTotal,
//       remainingPaymentsTotal,
//       totalPayments: totalCustomerPayments,
//       totalSellerPaymentsDue,
//       totalCustomerPayments,
//     };

//     apiResponse.success(res, req, stats);
//   } catch (err) {
//     apiResponse.fail(res, err.message, 500);
//   }
// };
