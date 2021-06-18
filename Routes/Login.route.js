const mongoose = require("mongoose");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const User = require("../Models/User.model");
const { loginValidation } = require("../Middlewares/Validation");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => {
  res.send("Please login.");
});

module.exports = router;
