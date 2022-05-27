const multer = require("multer");
const sharp = require("sharp");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
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
const ResizePhoto = catchAsync(async (req, res, next) => {
  if (!req.files.images[0]) next(new AppError("File not found!!", 404));
  req.files.images[0].filename = `editorial-${uuid()}-${Date.now()}.jpeg`;
  try {
    await sharp(req.files.images[0].buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/${req.files.images[0].filename}`);
  } catch (err) {
    next(new AppError("Error occurred while resizing image", 500));
  }
  next();
});
const GetImageURL = catchAsync(async (req, res, next) => {
  if (req.files.images[0].filename) {
    res.status(201).json({
      status: "success",
      message: "Image successfully Uploaded",
      data: {
        URL: `${req.protocol}://${req.get("host")}/img/${
          req.files.images[0].filename
        }`,
      },
    });
  } else {
    next(new AppError("File not found!!", 404));
  }
});

exports.uploadPhoto = upload.fields([{ name: "images", maxCount: 1 }]);
exports.getImageURL = GetImageURL;
exports.resizePhoto = ResizePhoto;
