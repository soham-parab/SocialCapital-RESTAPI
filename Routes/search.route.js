const express = require("express");
const router = express.Router();
const verify = require("../middlewares/verifyToken");
const User = require("../models/User.model");

router.get("/:searchText", verify, async (req, res) => {
  console.log(req);
  try {
    const { searchText } = req.params;
    const { userId } = req;
    console.log(searchText);
    if (searchText.length === 0) res.status(400).json([]);

    let userPattern = new RegExp(`^${searchText}`);

    const results = await User.find({
      name: { $regex: userPattern, $options: "i" },
    });

    const resultsToBeSent =
      results.length > 0 &&
      results.filter((result) => result._id.toString() !== userId);

    return res
      .status(200)
      .json(resultsToBeSent.length > 0 ? resultsToBeSent : results);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;
