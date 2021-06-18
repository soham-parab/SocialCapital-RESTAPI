const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
   {
      userId: {
         type: String,
         required: true,
      },
      postText: {
         type: String,
      },
      postImage: {
         type: String,
      },
      likes: {
         type: String,
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
