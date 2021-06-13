const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

PORT = process.env.PORT || 3005;

mongoose.connect(
   process.env.DB_CONNECTION,
   { useNewUrlParser: true, useUnifiedTopology: true },
   () => {
      console.log("connected");
   }
);

app.listen(PORT, () => {
   console.log("heyooooooo");
});
