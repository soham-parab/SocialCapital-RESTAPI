const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const User = require("../Models/User.model");
const { loginValidation } = require("../Middlewares/Validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  res.send("Please login.");
});

router.post("/", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //does username exist?
  const user = await User.findOne({
    username: req.body.username,
  });

  if (!user)
    return res
      .status(400)
      .send("Username doesn't exist, please register yourself.");

  //hashpassword
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const correctPassword = bcrypt.compare(req.body.password, user.password);

  if (!correctPassword) return res.status(400).send("Invalid Credentials");

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send({ token: token, user: user });
});

module.exports = router;

// {
//     "user": "60d349104769943c1c60170f"
// }
