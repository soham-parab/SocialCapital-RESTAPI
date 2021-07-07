const express = require("express");
const router = express.Router();
const verify = require("../middlewares/verifyToken");
const Notification = require("../models/Notification.model");
const User = require("../models/User.model");

router.get("/", verify, async (req, res) => {
  try {
    const { userId } = req;

    const user = await Notification.findOne({ user: userId })
      .populate("notifications.user")
      .populate("notifications.post");

    return res.json(user.notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

router.post("/", verify, async (req, res) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);

    if (user.unreadNotification) {
      user.unreadNotification = false;
      await user.save();
    }
    return res.status(200).send("Updated");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
