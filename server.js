require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const path = require('path');
const User = require('./models/User');

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// Socket 
const io = require('socket.io')(http)

io.on('connection', (socket) => {
    console.log('Connected...')
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg)
    })

})
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

setInterval(async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const inactiveUsers = await User.find({ lastActive: { $lt: tenMinutesAgo } });

  for (const user of inactiveUsers) {
    io.to(user.socketId).disconnect(true); // Disconnect socket if still alive
    await User.deleteOne({ _id: user._id });
  }

  // Refresh user list
  const users = await User.find({}, 'username');
  io.emit('online_users', users);
}, 60000); // Run every 60 seconds

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


