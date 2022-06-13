const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("../Models/UserModel");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const filterObj = (updateObj, filter) => {
  const objkeys = Object.keys(updateObj);
  objkeys.forEach((el) => {
    if (!filter.includes(el)) {
      delete updateObj[el];
    }
  });
  return updateObj;
};

exports.protect = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ rollNum: req.body.rollNum }).select(
    "+password"
  );
  if (!user)
    return next(new AppError("Either UserName or Password Wrong", 400));
  if (user.active === false)
    return next(new AppError("User inactive, contact Admin", 401));
  const compare = await user.correctPassword(req.body.password, user.password);
  if (compare) return next();
  console.log(compare);
  if (!user || !compare) {
    return next(new AppError("Either UserName or Password Wrong", 400));
  }
});

exports.checkJWT = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(
      new AppError("You do not have permission to access this route", 400)
    );
  }
  if (req.cookies) {
    // if (req.cookies.jwt) token = req.cookies.jwt;
    if (req.cookies.user) token = req.cookies.user;
  }
  if (!req.cookies && !req.cookies.jwt) {
    return next(
      new AppError("You do not have permission to access this route", 400)
    );
  }
  var currentUser;
  try{
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    currentUser = await User.findById(decoded.id);
  }catch(err){
    return next(new AppError("Invalid JWT",401))
  }
  if (!currentUser) return next(new AppError("Invalid User", 400));

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError("Token Expired, Login again", 400));

  req._id = decoded.id;
  next();
};

exports.UpdateUser = catchAsync(async (req, res, next) => {
  const updateObj = { ...req.body };
  const filteredObj = filterObj(updateObj, [
    "name",
    "profilePhoto",
    "email",
    "rollNum",
  ]);
  const ExistingUser = await User.findById(req._id);
  if (!ExistingUser) return next(new AppError("User does not exist", 400));
  ExistingUser.name = filteredObj.name;
  ExistingUser.rollNum = filteredObj.rollNum;
  ExistingUser.profilePhoto = filteredObj.profilePhoto;
  ExistingUser.email = filteredObj.email;
  await ExistingUser.save();
  res
    .status(200)
    .json({ status: "Success", message: "User updated", ExistingUser });
});

exports.DeleteUser = catchAsync(async (req, res, next) => {
  const ExistingUser = await User.findById(req.params.id);
  if (!ExistingUser) {
    return next(new AppError("User not found", 400));
  }
  const curUser = await User.findById(req._id);
  if (
    curUser.role === "owner" ||
    String(curUser._id) === String(ExistingUser._id)
  ) {
    await User.findOneAndUpdate(
      { _id: String(ExistingUser._id) },
      { active: false }
    );
  } else {
    return next(
      new AppError("You are not authorized to perform this action", 401)
    );
  }
  return res.status(200).json({ status: "Success", message: "User Deleted" });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req._id).select("+password");
  if (!req.body.currentPassword)
    return next(new AppError("Please provide the current password", 400));
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError("Invalid current Password", 400));
  if (await bcrypt.compare(req.body.password, user.password))
    return next(
      new AppError("New password shall not be same as the old one", 400)
    );
  user.password = req.body.password;
  user.cnfrmPassword = req.body.cnfrmPassword;
  if (req.body.password != req.body.cnfrmPassword)
    return next(
      new AppError("Confirm Password shall be same as Password", 400)
    );
  const status = await user.save({ validateBeforeSave: false });
  res.status(201).json({
    status: "success",
    message: "Password Changed",
  });
});
