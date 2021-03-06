const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter an email"],
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  // messages: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Chat"
  // }]
});

userSchema.virtual('messages', {
  ref: "Chat",
  localField: "_id",
  foreignField: "owner"
})

// Methods user-defined function that can be used directly on the instance to generate auth token
// We need this binding so we are using standard function
userSchema.methods.generateAuthToken = async function () {
  // Individual user that token will be generated for(Optional: So we don't have to use this.user down below)
  const user = this;
  // Create token, {_id: user._id.toString()} - payload, 'veggie-recipes' - secret
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  return token;
}

// Statics user-defined function that can be used directly on the model to find user credentials
// This binding will not play a role so can use arrow function
userSchema.statics.findByCredentials = async (email, password) => {
  // Will return one user, we provide object as search criteria
  const user = await User.findOne({ email });
  // If user is not found, throw error
  if (!user) {
    throw new Error('Unable to login');
  }
  // Compare plain-text password with user's hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  // If not a match, throw error
  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
}

// Middleware (Pre hook) function that runs before save action
// 'save' - name of event, function - function to run, 'next' - next() tells function that it's done
// function has to be standard, due to 'this' binding
// Hash password before user is saved
userSchema.pre('save', async function (next) {
  // Individual user that is about to be saved (Optional: So we don't have to use this.user down below)
  const user = this;
  // Check if password has been modified, isModified('password') is mongoose method, 'password' is the field to look for
  if (user.isModified('password')) {
    // Hash user password, user.password - thing to hash, 8 - number of rounds
    user.password = await bcrypt.hash(user.password, 8);
  }
  // Middleware is done
  next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;
