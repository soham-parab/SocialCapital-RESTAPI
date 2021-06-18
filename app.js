const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./Routes/Login.route");

dotenv.config();
app.use(express.json());

app.use("/users", userRoute);

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
