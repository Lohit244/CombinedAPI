const multer = require("multer");
const sharp = require("sharp");
const Epistle = require("./../Models/Epistle");
const User = require("../Models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `public/notices`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const filename = `notices-${Date.now()}.${ext}`;
    req.body.link = filename;
    cb(null, filename);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.includes("pdf")) {
    cb(null, true);
  } else {
    cb(new AppError("Not a PDF! Please upload only PDF.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadNotice = upload.fields([{ name: "pdf", maxCount: 1 }]);
exports.getURL = catchAsync(async (req, res, next) => {
  if (req.body.link) {
    res.status(201).json({
      status: "success",
      message: "File successfully Uploaded",
      data: {
        URL: `${req.protocol}://${req.get("host")}/notices/${req.body.link}`,
      },
    });
  } else {
    next(new AppError("File not found!!", 404));
  }
});

exports.deleteNotice = catchAsync(async (req, res, next) => {
  const fileName = req.params.fileName;
  fs.unlink(`public/notices/${fileName}`, (err) => {
    if (err) {
      console.log(err);
      return next(new AppError("No such file directory found", 200));
    }
    return res.status(200).json({
      status: "success",
      message: "File Successfully Deleted",
    });
  });
});

exports.checkUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req._id);
  if (user.role == "stage1") {
    return next(
      new AppError("You don't have the permission to access this route")
    );
  }
  next();
});
