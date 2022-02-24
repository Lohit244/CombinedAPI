const express = require("express");
const userRouter = require("./Routes/UserRoute");
const imageRoute = require("./Routes/imageRoute");
const globalErrorHandler = require("./Controllers/errorController");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const app = express();
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/image-upload", imageRoute);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
