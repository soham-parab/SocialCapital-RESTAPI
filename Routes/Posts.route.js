// const router = require("express").Router();

// const PostSchema = require("../models/Posts.model");
// const User = require("../models/User.model");
// const verify = require("../middlewares/verifyToken");

// //get specific post
// router.get("/:id", async (req, res) => {
//   try {
//     const getPost = await Post.findById(req.params.id);
//     res.status(200).json(getPost);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //Create a Post
// router.post("/", verify, async (req, res) => {
//   const newPost = new Post(req.body);

//   try {
//     const savedPost = await newPost.save();
//     res.status(200).json(savedPost);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// // Update a post
// router.patch("/:id", async (req, res) => {
//   try {
//     const updatePost = await Post.findById(req.params.id);
//     if (updatePost.userId === req.body.userId) {
//       await updatePost.updateOne({ $set: req.body });
//       res.status(200).json("Post has been updated!");
//     }
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// //Delete a post
// router.delete("/:id", async (req, res) => {
//   try {
//     const deletePost = await Post.findById(req.params.id);
//     if (deletePost.userId === req.body.userId) {
//       await deletePost.deleteOne();
//       res.status(200).json("Post deleted");
//     }
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //like a post

// //get feed

// //get user's timeline

// module.exports = router;

const express = require("express");
const router = express.Router();
const verify = require("../middlewares/verifyToken");
const Post = require("../models/Posts.model");
const User = require("../models/User.model");
const FollowStats = require("../models/Followstats.model");
const {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
} = require("../utilities/utils");

// CREATE A POST

router.post("/", verify, async (req, res) => {
  try {
    const newPost = {
      user: req.userId,
      text: req.body.text,
    };

    const post = await new Post(newPost).save();

    const postCreated = await Post.findById(post._id).populate("user");

    return res.json(postCreated);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

// GET ALL POSTS

router.get("/", verify, async (req, res) => {
  const { pageNumber } = req.query;
  const number = Number(pageNumber);
  const size = 8;

  try {
    let posts;
    if (number === 1) {
      posts = await Post.find()
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    } else {
      const skips = size * (number - 1);
      posts = await Post.find()
        .skip(skips)
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    }

    if (posts.length === 0) {
      return res.json([]);
    }

    let postsToBeSent = [];
    const { userId } = req;

    const loggedUser = await FollowStats.findOne({ user: userId });

    if (loggedUser.following.length === 0) {
      postsToBeSent = posts.filter(
        (post) => post.user._id.toString() === userId
      );
    } else {
      for (let i = 0; i < loggedUser.following.length; i++) {
        const foundPostsFromFollowing = posts.filter(
          (post) =>
            post.user._id.toString() === loggedUser.following[i].user.toString()
        );

        if (foundPostsFromFollowing.length > 0)
          postsToBeSent.push(...foundPostsFromFollowing);
      }
      const foundOwnPosts = posts.filter(
        (post) => post.user._id.toString() === userId
      );
      if (foundOwnPosts.length > 0) postsToBeSent.push(...foundOwnPosts);
    }

    postsToBeSent.length > 0 &&
      postsToBeSent.sort((a, b) => [
        new Date(b.createdAt) - new Date(a.createdAt),
      ]);

    return res.json(postsToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

//GET SPECIFIC POST

router.get("/:postId", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("user")
      .populate("comments.user");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    return res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

// DELETE POST

router.delete("/:postId", verify, async (req, res) => {
  try {
    const { userId } = req;

    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("post not found");
    }

    const user = await User.findById(userId);

    if (post.user.toString() !== userId) {
      if (user.role === "root") {
        await post.remove();
        return res.status(200).send("Post deleted Successfully");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }

    await post.remove();
    return res.status(200).send("Post deleted Successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

// LIKE A POST

router.post("/like/:postId", verify, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("No Post found");
    }

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0;

    if (isLiked) {
      return res.status(401).send("Post already liked");
    }

    await post.likes.unshift({ user: userId });
    await post.save();

    if (post.user.toString() !== userId) {
      await newLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post liked");
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

// UNLIKE A POST

router.put("/unlike/:postId", verify, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("No Post found");
    }

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length === 0;

    if (isLiked) {
      return res.status(401).send("Post not liked before");
    }

    const index = post.likes
      .map((like) => like.user.toString())
      .indexOf(userId);

    await post.likes.splice(index, 1);

    await post.save();

    if (post.user.toString() !== userId) {
      await removeLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post Unliked");
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

// GET ALL LIKES OF A POST

router.get("/like/:postId", verify, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("likes.user");
    if (!post) {
      return res.status(404).send("No Post found");
    }

    return res.status(200).json(post.likes);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

// CREATE A COMMENT

router.post("/comment/:postId", verify, async (req, res) => {
  try {
    const { postId } = req.params;

    const { userId } = req;
    const { text } = req.body;

    if (text.length < 1)
      return res.status(401).send("Comment should be atleast 1 character");

    const post = await Post.findById(postId);

    if (!post) return res.status(404).send("Post not found");

    const newComment = {
      _id: uuid(),
      text,
      user: userId,
      date: Date.now(),
    };

    await post.comments.unshift(newComment);
    await post.save();

    if (post.user.toString() !== userId) {
      await newCommentNotification(
        postId,
        newComment._id,
        userId,
        post.user.toString(),
        text
      );
    }

    return res.status(200).json(newComment);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

// DELETE A COMMENT

router.delete("/:postId/:commentId", verify, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).send("Post not found");

    const comment = post.comments.find((comment) => comment._id === commentId);
    if (!comment) {
      return res.status(404).send("No Comment found");
    }

    const user = await User.findById(userId);

    const deleteComment = async () => {
      const indexOf = post.comments
        .map((comment) => comment._id)
        .indexOf(commentId);

      await post.comments.splice(indexOf, 1);

      await post.save();

      if (post.user.toString() !== userId) {
        await removeCommentNotification(
          postId,
          commentId,
          userId,
          post.user.toString()
        );
      }

      return res.status(200).send("Deleted Successfully");
    };

    if (comment.user.toString() !== userId) {
      if (user.role === "root") {
        await deleteComment();
      } else {
        return res.status(401).send("Unauthorized");
      }
    }

    await deleteComment();
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;
