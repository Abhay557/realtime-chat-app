require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const socketIo = require('socket.io');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO
io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  // When user connects and sends username
  socket.on('user_connected', async (username) => {
    await User.findOneAndUpdate(
      { socketId: socket.id },
      { username, lastActive: new Date() },
      { upsert: true, new: true }
    );
    broadcastOnlineUsers();
  });

  // Track activity to reset inactivity timer
  socket.on('activity', async () => {
    await User.findOneAndUpdate(
      { socketId: socket.id },
      { lastActive: new Date() }
    );
  });

  // When user disconnects
  socket.on('disconnect', async () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
    await User.deleteOne({ socketId: socket.id });
    broadcastOnlineUsers();
  });

  // Function to emit all current online users
  async function broadcastOnlineUsers() {
    const users = await User.find({}, 'username');
    io.emit('online_users', users);
  }
});

// Periodically clean up inactive users (every 60 seconds)
setInterval(async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const inactiveUsers = await User.find({ lastActive: { $lt: tenMinutesAgo } });

  for (const user of inactiveUsers) {
    io.to(user.socketId).disconnect(true); // Disconnect if still connected
    await User.deleteOne({ _id: user._id });
  }

  // Refresh the list of online users
  const users = await User.find({}, 'username');
  io.emit('online_users', users);
}, 60000); // Every 60 seconds

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
