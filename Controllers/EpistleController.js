const multer = require("multer");
const sharp = require("sharp");
const Epistle = require("./../Models/Epistle");
const User = require("../Models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const apiFeatures = require("./../utils/APIFeatures");
const fs = require("fs");
const res = require("express/lib/response");

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
        fileName: req.body.link,
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

exports.addNotice = catchAsync(async (req, res, next) => {
  const { title, links, content } = req.body;
  console.log(req.body);
  const DateAdded = new Date().toISOString();
  const NoticeObject = {
    title,
    DateAdded,
    links,
    content,
  };
  const Notice = new Epistle(NoticeObject);
  try {
    await Notice.save();
  } catch (err) {
    // links.map(link => fs.unlink(`public/notices/${link}`))
    return next(new AppError("Notice could not be saved", 500));
  }
  return res.status(201).json({ status: "success", Notice: Notice });
});
exports.getAllNotice = catchAsync(async (req, res, next) => {
  req.query = req.query || {};
  const page = req.query.page;
  const currentDate = new Date(Date.now());
  const date = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
  const pages = Math.ceil((await Epistle.countDocuments()) / 10);
  const group = await Epistle.aggregate([
    {
      $match: {
        DateAdded: { $gte: date },
      },
    },
    {
      $sort: { DateAdded: -1 },
    },
    {
      $skip: (page - 1) * 10,
    },
    { $limit: 10 },
    {
      $group: {
        _id: { $month: "$DateAdded" },
        notices: {
          $push: {
            _id: "$_id",
            title: "$title",
            content: "$content",
            links: "$links",
            DateAdded: "$DateAdded",
          },
        },
        Date: { $first: "$DateAdded" },
      },
    },
    {
      $sort: { Date: -1 },
    },
  ]);
  return res.status(200).json({
    pages,
    currentPage: Number(page),
    data: group,
  });
});

exports.DeleteEpistlePost = catchAsync(async (req, res, next) => {
  const notice = await Epistle.findById(req.params.noticeId);
  if (!notice) return next("No notice found with that ID");
  if (notice.links.length) {
    notice.links.forEach((filename) => {
      fs.unlink(`public/notices/${filename}`, (err) => {});
    });
  }
  await Epistle.findByIdAndDelete(req.params.noticeId);
  return res.status(200).json({
    status: "success",
    message: "Notice successfully deleted",
  });
});
