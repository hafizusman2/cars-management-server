// External Modules
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/config");

const phone = "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$";
exports.PhoneRegex = new RegExp(phone);
const objectId = "^[0-9a-fA-F]{24}$";
exports.objectIdRegex = new RegExp(objectId);

exports.setPassword = async (password) => {
  const salt = await bcrypt.genSalt(parseInt(config.salt));
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

exports.matchPassword = async (password, user_password) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user_password, function (err, hash) {
      if (hash) {
        resolve(hash);
      } else {
        console.log(err);
        reject("Invalid Password");
      }
    });
  });
};

exports.createJwtToken = (
  user,
  secret = config.jwt.secret,
  expiry = config.jwt.expirationInDays
) => {
  try {
    const token = jwt.sign(
      {
        id: user._id,
        status: user.status,
      },
      secret,
      { expiresIn: expiry }
    );
    return token;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.get_pagination_params = ({ limit, page, search }) => {
  limit = parseInt(limit) || 15;
  page = parseInt(page) || 1;
  search = search || false;
  let offset = (page - 1) * limit;

  if (page <= 0) page = 1;
  if (offset <= 0) offset = 0;
  if (limit < 0) limit *= -1;
  return { limit, offset, search };
};
