const dotenv = require("dotenv");
const express = require("express");

dotenv.config({ path: "./env" });
const app = require("./app");
const mongoose = require("mongoose");
console.log(process.env.JWT_SECRET);
mongoose.connect(`mongodb://localhost:27017/NapsUserDB`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
});

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
