const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const User = require("../Models/User.model");
const { registerValidation } = require("../Middlewares/Validation");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => {
  res.send("Please register.");
});

router.post("/", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //does email already exist?
  const userAlreadyExists = await User.findOne({ username: req.body.username });
  if (userAlreadyExists)
    return res
      .status(400)
      .send("This username is already registered, please login.");

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.send({ User: savedUser._id });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
