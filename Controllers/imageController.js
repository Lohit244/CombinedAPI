const multer = require("multer");
const sharp = require("sharp");
const HttpError = require("../Models/http-error");
const catchAsync = require("./../utlis/catchAsync");
const AppError = require("./../utlis/appError");
const { v1: uuid } = require("uuid");
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
const ResizePhoto = async (req, res, next) => {
  if (!req.file) next(new HttpError("File not found!!", 404));
  req.file.filename = `editorial-${uuid()}-${Date.now()}.jpeg`;
  try {
    await sharp(req.file.buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/${req.file.filename}`);
  } catch (err) {
    next(new HttpError("Error occurred while resizing image", 500));
  }
  next();
};
const GetImageURL = async (req, res, next) => {
  if (req.file.filename) {
    res.status(201).json({
      status: "success",
      message: "Image successfully Uploaded",
      data: {
        URL: `${req.protocol}://${req.get("host")}/img/${req.file.filename}`,
      },
    });
  } else {
    next(new HttpError("File not found!!", 404));
  }
};

exports.uploadPhoto = upload.single("photo");
exports.getImageURL = GetImageURL;
exports.resizePhoto = ResizePhoto;
