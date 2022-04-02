const dotenv = require("dotenv");
const express = require("express");

dotenv.config({ path: "./env" });
const app = require("./app");
const mongoose = require("mongoose");
console.log(process.env.JWT_SECRET);
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@napsuserdb.n9gvp.mongodb.net/NapsUserDB?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
});

app.listen(4000, () => {
  console.log("Server listening at port 4000");
});
