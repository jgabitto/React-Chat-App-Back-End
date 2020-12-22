const path = require("path");
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const socketio = require("socket.io");
const hbs = require("hbs");
const favicon = require("serve-favicon");

require("./db/mongoose");
const userRouter = require("../src/routers/user");
const chatRouter = require("../src/routers/chat");

const {
  generateMessage
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");


const app = express();
const server = http.createServer(app); // Explicitly creating server
const io = socketio(server);
// Parse incoming JSON into an object so it can be accessed in our req handlers
app.use(express.json());
// Accepts json data within the form data
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
// app.use(favicon(`${publicDirectoryPath}/chat.png`));

// res.set('Access-Control-Allow-Origin', req.headers.origin)
// res.set('Access-Control-Allow-Credentials', 'true')
// app.use(cors({ origin: true, credentials: true, exposedHeaders: 'Authorization' }));
app.use(cors({
  origin: 'https://jorge-chat-app.netlify.app', credentials: true, exposedHeaders: 'Authorization', methods: ["GET,HEAD,PUT,PATCH,POST, OPTIONS"]
}));
app.use(cookieParser());
app.use(userRouter);
app.use(chatRouter);

// socket.emit --> sends an event to a specific client
// io.emit --> sends an event to every connected client
// socket.broadcast.emit --> sends an event to every connected client except to self
// io.to.emit --> sends an event to everybody in a sepcific room
// socket.broadcast.to.emit --> sends an event to everyone, except self, in a specific room


io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on('join', (options, callback) => {
    console.log('options', options)
    // if (!options.hasOwnProperty('status')) {
    // Add user to room
    const { error, user } = addUser({ id: socket.id, ...options })

    // Return error if user was not added
    if (error) {
      return callback(error);
    }
    // Join chat room
    socket.join(user.room);
    // Welcome message
    socket.emit('welcome', generateMessage(null, 'Welcome!'));
    // Broadcast to everyone except new user, that new user has joined
    socket.broadcast.to(user.room).emit('serverMessage', generateMessage("Admin", `${user.username} has joined!`))
    // Send list of users in room after user has joined
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    // }
    // Send list of users in room after user has joined
    io.to(options.room).emit('roomData', {
      room: options.room,
      users: getUsersInRoom(options.room)
    })
    callback();
  })
  // Receive message from client
  socket.on('clientMessage', (message, callback) => {
    // Get user in room socket.id
    const user = getUser(socket.id);
    // Get properties from client message
    const { username, createdAt, text } = message;
    console.log(`This is the client message ${text}`)

    // Send message to everyone
    io.to(user.room).emit('serverMessage', generateMessage(user.username, text, createdAt))
    callback(`${message.text}`);
  })

  socket.on('disconnect', () => {
    // Remove user from room
    const user = removeUser(socket.id);
    // Send message if user has left
    if (user) {
      console.log('room', getUsersInRoom(user.room))

      console.log(`${user.username} has left`)
      io.to(user.room).emit('serverMessage', generateMessage("Admin", `${user.username} has left!`))
      // Send list of users after user has left
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
});

module.exports = server;
