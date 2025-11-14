var express = require("express");
const { UserModel } = require("../models/user.model");
var userRouter = express.Router();

userRouter.post("/createUser", (req, res) => {
  try {
    UserModel.create(req.body)
      .then((response) => {
        res.status(201).json({
          Message: "User is created successfully",
          Status: "success",
          data: response,
        });
      })
      .catch((error) => {
        res.status(500).json({
          Message: "Something went Wrong",
          Status: `error ${error}`,
        });
      });
  } catch (error) {
    res
      .status(500)
      .json({ Message: "Something went Wrong", Status: `error ${error}` });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.json({ Message: "Email and password is required", status: 401 });
      return;
    }
    const user = await UserModel.findOne({ email });
    if (!(user && (await user.comparePassword(password)))) {
      return res.status(401).json({ Message: "Email or password do not match" });
    }
    const token = await user.generateJWTToken();
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
      Message: "User logged in successfully",
      success: true,
      token: token, // Send token in response for client-side storage
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ Message: "Something went Wrong", Status: `error ${error}` });
  }
});

module.exports = { userRouter };
