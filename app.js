const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const loginRoute = require("./Routes/Login.route");
const registerRoute = require("./Routes/Register.route");

dotenv.config();
app.use(express.json());

app.use("/login", loginRoute);
app.use("/register", registerRoute);

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
