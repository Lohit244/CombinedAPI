const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const designation = require("./../devData/designation");
const rollAttribute = require("./../devData/rollAttribute");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Kindly, provide the name"],
  },
  email: {
    type: String,
    required: [true, "Kindly, provide the mailId"],
  },
  rollNum: {
    type: String,
    required: [true, "Kindly, provide the roll number"],
    validate: {
      validator: function (el) {
        if (!el.includes("/")) return false;
        regexp = /\//gi;
        const array = [...el.matchAll(regexp)];
        if (array.length < 2) return false;
        const attribute = el.split("/");
        const attribute1 = attribute[0].toUpperCase();
        const allattribute = [...rollAttribute];
        if (!allattribute.includes(attribute1)) return false;
      },
      message: "Invalid roll number",
    },
  },
  workEditorial: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "naps_blog",
    },
  ],
  workMediaReport: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "naps_blog",
    },
  ],
  workSiteReport: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "naps_blog",
    },
  ],
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: "naps_author",
    required: [true, "Author ID must be provided"],
  },
  designation: {
    type: String,
    enum: {
      values: [...designation],
      message: "Designation did not match any of the following list",
    },
    default: "Naps-Member",
  },
  profilePhoto: String,
  password: {
    type: String,
    required: [true, "Kindly, provide the password"],
    minlength: [8, "A password should have minimum length of 8"],
    select: false,
  },
  cnfrmPassword: {
    type: String,
    required: [true, "Kindly, provide the confirm password"],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: "Passwords does not match",
    },
    select: false,
  },
  role: {
    type: String,
    enum: {
      values: ["stage1", "stage2", "stage3", "owner"],
      message:
        "Role cannot be anything other than stage1, stage2, stage3 or owner",
    },
    default: "stage1",
  },
  active: {
    type: Boolean,
    default: true,
  },
  passwordChangedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
userSchema.pre("save", async function (next) {
  // console.log('hi i am in befor e hashing ');
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.cnfrmPassword = undefined;
  next();
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("rollNum")) return next();
  const attribute = this.rollNum.split("/");
  const attribute1 = attribute[0].toUpperCase();
  let regex = `${attribute1}`;
  regex = new RegExp(regex, "i");
  this.rollNum = this.rollNum.replace(regex, attribute1);
  console.log(this.rollNum);
  next();
});
userSchema.pre(/^update/, async function (next) {
  if (!this.update.rollNum) return next();
  const attribute = this.update.rollNum.split("/");
  const attribute1 = attribute[0].toUpperCase();
  let regex = `${attribute1}`;
  regex = new RegExp(regex, "i");
  this.rollNum = this.rollNum.replace(regex, attribute1);
  next();
});
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model("User", userSchema);
module.exports = User;
