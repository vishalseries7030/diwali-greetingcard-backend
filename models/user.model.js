var mongoose = require("mongoose");
var validator = require("validator");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

let userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Kindly Input the first Name"],
  },
  lastName: {
    type: String,
    required: [true, "Kindly Input the last Name"],
  },
  email: {
    type: String,
    required: [true, "Kindly Input the Email"],
    unique: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Kindly Provide the password"],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods = {
  comparePassword: async function (plainpassword) {
    return await bcrypt.compare(plainpassword, this.password);
  },
  generateJWTToken: async function () {
    return await jwt.sign(
      { id: this._id, email: this.email }, 
      process.env.JWT_SECRET || "123AccioJob",
      { expiresIn: "7d" }
    );
  },
};

const UserModel = mongoose.model("User", userSchema);
module.exports = { UserModel };

// sat  ; backend (); Frontend (Greeting)
