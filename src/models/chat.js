const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  messages: [{
    type: String,
    required: true,
    trim: true,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
