const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

//upload images
const imageFileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error("Error: File Type is not supported!"), false);
  }
};

//images and videos
const videoFileFilter = (req, file, cb) => {
  const fileTypes = /mp4|avi|mov|wmv|flv|mpeg|3gp|jpeg|jpg|png|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error("Error: File Type is not supported!"), false);
  }
};

const imageUpload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
});

const assetUpload = multer({
  storage: storage,
  fileFilter: videoFileFilter,
});

module.exports = {
  imageUpload,
  assetUpload,
};
