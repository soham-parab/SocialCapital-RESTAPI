const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
   {
      userName: {
         type: String,
         required: true,
         minimum: 3,
         maximum: 20,
         unique: true,
      },
      password: {
         type: String,
         required: true,
         min: 6,
      },

      profilePicture: {
         type: String,
         default: "",
      },
      coverPicture: {
         type: String,
         default: "",
      },
      followers: {
         type: Array,
         default: [],
      },
      followings: {
         type: Array,
         default: [],
      },
      from: {
         type: String,
         max: 50,
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
