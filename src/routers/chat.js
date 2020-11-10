const express = require('express');

const User = require('../models/user');
const Chat = require('../models/chat');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post("/saveChat", auth, async (req, res) => {
  console.log(req.body);

  try {
    const messages = new Chat({ messages: req.body, owner: req.user._id });

    await messages.save();

    return res.sendStatus(200);

  } catch (e) {
    console.log(e.message)
    return res.sendStatus(500);
  }
})

router.get("/getMessages", auth, async (req, res) => {
  try {
    const savedMessages = await (await User.findOne({ _id: req.user._id }).populate("messages")).execPopulate();
    console.log(savedMessages)
    return res.json(savedMessages.messages)
  } catch (e) {
    console.log(e.message)
    return res.sendStatus(500);
  }
})

module.exports = router;