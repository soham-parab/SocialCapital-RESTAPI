const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    postText: {
      type: String,
    },

    likes: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
