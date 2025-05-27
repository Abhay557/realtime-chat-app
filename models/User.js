const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  socketId: String,
  username: String,
  lastActive: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
