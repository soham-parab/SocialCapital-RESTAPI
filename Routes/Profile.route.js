const express = require("express");
const router = express.Router();
const verify = require("../middlewares/verifyToken");
const User = require("../models/User.model");
const PostSchema = require("../models/Posts.model");
const FollowStats = require("../models/Followstats.model");
const Profile = require("../models/UserProfile.model");
const bcrypt = require("bcryptjs");
const {
  newFollowerNotification,
  removeFollowerNotification,
} = require("../utilities/utils");

// GET PROFILE INFO

router.get("/:username", verify, async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("No User Found");
    }

    const profile = await Profile.findOne({ user: user._id }).populate("user");

    const profileFollowStats = await FollowStats.findOne({ user: user._id });

    return res.json({
      profile,
      followers:
        profileFollowStats.followers.length > 0
          ? profileFollowStats.followers.map((item) => item.user)
          : [],

      following:
        profileFollowStats.following.length > 0
          ? profileFollowStats.following.map((item) => item.user)
          : [],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// GET POSTS OF USER
router.get(`/posts/:username`, verify, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("No User Found");
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments.user");

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// GET FOLLOWERS OF USER
router.get("/followers/:userId", verify, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await FollowStats.findOne({ user: userId }).populate(
      "followers.user"
    );

    return res.json(user.followers);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// GET FOLLOWING OF USER
router.get("/following/:userId", verify, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await FollowStats.findOne({ user: userId }).populate(
      "following.user"
    );

    return res.json(user.following);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// FOLLOW A USER
router.post("/follow/:userToFollowId", verify, async (req, res) => {
  try {
    const { userId } = req;
    const { userToFollowId } = req.params;

    const user = await FollowStats.findOne({ user: userId });
    const userToFollow = await FollowStats.findOne({ user: userToFollowId });

    if (!user || !userToFollow) {
      return res.status(404).send("User not found");
    }

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter(
        (following) => following.user.toString() === userToFollowId
      ).length > 0;

    if (isFollowing) {
      return res.status(401).send("User Already Followed");
    }

    await user.following.unshift({ user: userToFollowId });
    await user.save();

    await userToFollow.followers.unshift({ user: userId });
    await userToFollow.save();

    await newFollowerNotification(userId, userToFollowId);

    return res.status(200).send("Updated");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// UNFOLLOW A USER

router.put("/unfollow/:userToUnfollowId", verify, async (req, res) => {
  try {
    const { userId } = req;
    const { userToUnfollowId } = req.params;

    const user = await FollowStats.findOne({
      user: userId,
    });

    const userToUnfollow = await FollowStats.findOne({
      user: userToUnfollowId,
    });

    if (!user || !userToUnfollow) {
      return res.status(404).send("User not found");
    }

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter(
        (following) => following.user.toString() === userToUnfollowId
      ).length === 0;

    if (isFollowing) {
      return res.status(401).send("User Not Followed before");
    }

    const removeFollowing = await user.following
      .map((following) => following.user.toString())
      .indexOf(userToUnfollowId);

    await user.following.splice(removeFollowing, 1);
    await user.save();

    const removeFollower = await userToUnfollow.followers
      .map((follower) => follower.user.toString())
      .indexOf(userId);

    await userToUnfollow.followers.splice(removeFollower, 1);
    await userToUnfollow.save();

    await removeFollowerNotification(userId, userToUnfollowId);

    return res.status(200).send("Updated");
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

module.exports = router;
