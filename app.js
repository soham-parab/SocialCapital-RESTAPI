const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const loginRoute = require("./Routes/Login.route");
const registerRoute = require("./Routes/Register.route");
const postRoute = require("./Routes/Posts.route");
const profileRoute = require("./Routes/Profile.route");
const cors = require("cors");

dotenv.config();
app.use(express.json());
app.use(cors());
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/posts", postRoute);
app.use("/profile", profileRoute);

PORT = process.env.PORT || 3005;

mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("connected");
  }
);

app.get("/", (req, res) => res.send("holaaaaaaaa"));

app.listen(PORT, () => {
  console.log("heyooooooo");
});
