const User = require("./../Models/UserModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const apiFeature = require("./../utils/APIFeatures");
const apiFeatures = require("./../utils/APIFeatures");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode = 200, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "Success",
    token,
    data: {
      user,
    },
  });
};
const filterObj = (updateObj, filter) => {
  const objkeys = Object.keys(updateObj);
  objkeys.forEach((el) => {
    if (!filter.includes(el)) {
      delete updateObj[el];
    }
  });

  return updateObj;
};
exports.login = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ rollNum: req.body.rollNum });
  createSendToken(user, 200, res);
});

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.findById(req._id);
  if (user.role !== "owner")
    return next(
      new AppError(
        "You are not authorized to create account, contact the owner",
        400
      )
    );
  const checknewUser = await User.findOne({ rollNum: req.body.rollNum });
  if (checknewUser) return next(new AppError("User already exists", 400));
  const authorId = ObjectId(req.body.authorId);
  const UserObj = {
    name: req.body.name,
    email: req.body.email,
    rollNum: req.body.rollNum,
    password: req.body.password,
    cnfrmPassword: req.body.cnfrmPassword,
    authorId: authorId,
  };
  const newUser = await User.create(UserObj);
  res.status(201).json({
    status: "success",
    message: "User Created",
  });
});

exports.viewMembers = catchAsync(async (req, res, next) => {
  const queryString = req.query;
  const features = new apiFeatures(User.find({}), queryString).filter();
  const finalQuery = features.query.select(
    " rollNum name  designation  profilePhoto role "
  );
  const result = await finalQuery;
  return res.status(200).json({
    status: "success",
    message: "List of all the users",
    data: {
      data: result,
    },
  });
});
exports.viewProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select(
    "rollNum name  designation  profilePhoto role  workEditorial  workMediaReport workSiteReport email"
  );
  if (!user) return next(new AppError("user does not exist", 400));

  res.status(201).json({
    status: "success",
    message: "user Detail",
    data: {
      data: user,
    },
  });
});
exports.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const currentUser = await User.findById(req._id);
  const userProfile = await User.findById(userId);
  const updateObj = { ...req.body };
  if (currentUser.role == "owner") {
    const filteredObj = filterObj(updateObj, ["role", "designation"]);
    const userProfile = User.findById(userId);
    const updates = await userProfile.updateOne({ _id: userId }, filteredObj, {
      runValidators: true,
    });
  }
  if (currentUser.role.startsWith("stage")) {
    const CurrentUserstage = currentUser.role.slice(-1);
    if (userProfile.role == "owner")
      return next(
        new AppError("You are not authorized to perform this task", 401)
      );
    const Userstage = userProfile.role.slice(-1);

    if (Number(CurrentUserstage) <= Number(Userstage)) {
      if (req.body.role)
        return next(
          new AppError("You are not authorized to perform this task", 401)
        );
    }
    if (Number(req.body.role) > Number(CurrentUserstage))
      return next(
        new AppError(
          "You cannot upgrade a member to the requested position",
          401
        )
      );
    const updateObj = { ...req.body };
    const filteredObj = filterObj(updateObj, ["role"]);
    const userProfile1 = User.findById(userId);
    const updates = await userProfile1.updateOne({ _id: userId }, filteredObj, {
      runValidators: true,
    });
  }
  if (req._id == userProfile._id) {
    const updateObj = req.body;
    const filteredObj = filterObj(updateObj, [
      "email",
      "name",
      "rollNum",
      "profilePhoto",
    ]);
    const userProfile1 = User.findById(userId);
    const updates = await userProfile1.updateOne({ _id: userId }, filteredObj, {
      runValidators: true,
    });
  }
  const updatedUser = await User.findById(userId);
  res.status(201).json({
    status: "success",
    message: "Successfully changed",
    data: {
      data: updatedUser,
    },
  });
});
