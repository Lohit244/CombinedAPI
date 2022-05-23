const express = require("express");
const userRouter = require("./Routes/UserRoute");
const globalErrorHandler = require("./Controllers/errorController");
const AppError = require("./utils/appError");
const imageRoute = require("./Routes/imageRoute");
const blogRoute = require("./Routes/blogRoute");
const tagsRoute = require("./Routes/tagsRoute");
const authorRoute = require("./Routes/authorRoute");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
  credentials:true,
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/v1/users", userRouter);
app.use("/api/v1/image-upload", imageRoute);
app.use("/api/v1/blog", blogRoute);
app.use("/api/v1/author", authorRoute);
app.use("/api/v1/tags", tagsRoute);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
