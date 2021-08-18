const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const { registerValidation } = require("../middlewares/Validation");
const bcrypt = require("bcryptjs");
const Notification = require("../models/Notification.model");
const FollowStats = require("../models/Followstats.model");
const Profile = require("../models/UserProfile.model.js");
router.get("/", (req, res) => {
  res.send("Please register.");
});

router.post("/", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.send(error.details[0].message).status(401);

  const usernameAlreadyExists = await User.findOne({
    username: req.body.username,
  });
  if (usernameAlreadyExists) {
    return res.status(400).send("This username already exists, please log in!");
  }
  //hashpassword
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    username: req.body.username,
    password: hashedPassword,
  });

  console.log(user);
  try {
    const savedUser = await user.save();
    await new FollowStats({
      user: savedUser._id,
      followers: [],
      following: [],
    }).save();
    await new Notification({ user: savedUser._id, notifications: [] }).save();
    await new Profile({ user: savedUser._id }).save();
    res.send({ user: savedUser._id });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
