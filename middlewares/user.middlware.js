var jwt = require("jsonwebtoken");
const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    res.json({ Message: "Unauthorized to do it!!" });
    return;
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET || "123AccioJob");
  if (!decoded) {
    res.status(401).json({ Message: "Unauthorized to do it!!" });
    return;
  }
  next();
};

module.exports = { isLoggedIn };
