const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const { registerValidation } = require("../middlewares/Validation");
const bcrypt = require("bcryptjs");

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
    res.send({ user: savedUser._id });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
