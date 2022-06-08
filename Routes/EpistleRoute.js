const EpistleController = require("./../Controllers/EpistleController");
const userController = require("./../Controllers/userController");
const express = require("express");
const router = express.Router();
router.route("/Notice").get(EpistleController.getAllNotice);
router.use(userController.checkJWT, EpistleController.checkUser);
router.route("/Notice/:noticeId").delete(EpistleController.DeleteEpistlePost);
router
  .route("/uploadFile")
  .post(EpistleController.uploadNotice, EpistleController.getURL);
router.route("/deleteFile/:fileName").delete(EpistleController.deleteNotice);

router.route("/newNotice").post(EpistleController.addNotice);

module.exports = router;
