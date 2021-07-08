// const jwt = require("jsonwebtoken");

// module.exports = function (req, res, next) {
//   const token = req.header("auth-token");
//   if (!token) {
//     return res.status(401).send("ACCESS DENIED");
//   }

//   try {
//     const verified = jwt.verify(token, process.env.TOKEN_SECRET);
//     req.user = verified;
//     next();
//   } catch (error) {
//     res.status(401).send("Invalid credentials");
//   }
// };

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send("Access Denied");

  try {
    const { _id } = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = _id;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};
