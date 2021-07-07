const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  notifications: [
    {
      type: {
        type: String,
        enum: ["newLike", "newFollower"],
      },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
      text: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Notification", NotificationSchema);
