require('dotenv').config(); // ✅ Load .env first

const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // ✅ Message model

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ✅ REST endpoint to fetch messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: 1 }).limit(50);
    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Could not fetch messages" });
  }
});

// ✅ Socket.io logic
io.on('connection', async (socket) => {
  console.log('👤 A user connected');

  // Optional: store username if you're tracking users
  socket.on('set username', (username) => {
    socket.username = username || "Anonymous";
  });

  // ✅ Send chat history
  try {
    const messages = await Message.find({}).sort({ createdAt: 1 }).limit(50);
    socket.emit('chat history', messages);
  } catch (err) {
    console.error('❌ Error fetching chat history:', err);
  }

  // ✅ Handle incoming messages
  socket.on('chat message', async (msgData) => {
    const message = {
      username: msgData.username || socket.username || "Anonymous",
      message: msgData.message
    };

    try {
      await Message.create(message); // Save to DB
      io.emit('chat message', message); // Broadcast to everyone
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('👤 A user disconnected');
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
