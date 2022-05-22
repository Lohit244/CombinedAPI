const express = require("express");
const router = express.Router();
const userController = require("./../Controllers/userController");
const authController = require("./../Controllers/authController");
const { check } = require("express-validator");
router.route("/signUp").post(userController.checkJWT,authController.signUp);
router.post("/login", userController.protect, authController.login);
router.patch(
  "/update",
  userController.checkJWT,
  [
    check("name").not().isEmpty(),
    check("rollNum").not().isEmpty(),
    check("profilePhoto").not().isEmpty(),
    check("email").not().isEmpty(),
  ],
  userController.UpdateUser
);
router.delete(
  "/delete/:id",
  userController.checkJWT,
  userController.DeleteUser
);
router
  .route("/viewMembers")
  .get(userController.checkJWT, authController.viewMembers);
router.get(
  "/viewProfile/:userId",
  userController.checkJWT,
  authController.viewProfile
);
router.patch(
  "/updateProfile/:userId",
  userController.checkJWT,
  authController.updateProfile
);
router.patch(
  "/updatePassword",
  userController.checkJWT,
  userController.updatePassword
);
module.exports = router;
