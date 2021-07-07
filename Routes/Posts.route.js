const router = require("express").Router();

const PostSchema = require("../models/Posts.model");
const User = require("../models/User.model");
const verify = require("../middlewares/verifyToken");

//get specific post
router.get("/:id", async (req, res) => {
  try {
    const getPost = await Post.findById(req.params.id);
    res.status(200).json(getPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Create a Post
router.post("/", verify, async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update a post
router.patch("/:id", async (req, res) => {
  try {
    const updatePost = await Post.findById(req.params.id);
    if (updatePost.userId === req.body.userId) {
      await updatePost.updateOne({ $set: req.body });
      res.status(200).json("Post has been updated!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const deletePost = await Post.findById(req.params.id);
    if (deletePost.userId === req.body.userId) {
      await deletePost.deleteOne();
      res.status(200).json("Post deleted");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like a post

//get feed

//get user's timeline

module.exports = router;
