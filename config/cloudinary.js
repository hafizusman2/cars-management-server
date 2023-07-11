const cloudinary = require("cloudinary").v2;
const config = require("./config");
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
  secure: config.cloudinary.secure,
});

exports.uploadImage = async (file, public_id) => {
  if (!public_id) {
    return await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: config.cloudinary.folder_name,
      use_filename: true,
      unique_filename: false,
    });
  } else {
    console.log(public_id);
    return await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: config.cloudinary.folder_name,
      public_id: public_id,
      overwrite: true,
      unique_filename: false,
    });
  }
};

exports.deleteImage = async (public_id) => {
  return await cloudinary.uploader.destroy(public_id);
};
