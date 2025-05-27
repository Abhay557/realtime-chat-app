const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // Import the model

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
require('dotenv').config(); // should be at the top
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io logic
io.on('connection', async (socket) => {
  console.log('A user connected');

  // Send last 50 messages to new user
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
    socket.emit('chat history', messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
  }
  
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: 1 }).limit(50);
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Could not fetch messages" });
  }
});
  // Receive and broadcast chat messages
  socket.on('chat message', async (msgData) => {
    io.emit('chat message', msgData);
    try {
      await Message.create(msgData);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
