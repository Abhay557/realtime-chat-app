const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Prompt for username
let username = prompt("Enter your name:") || "Anonymous";

// Receive chat history
socket.on('chat history', (history) => {
  history.forEach(msg => {
    appendMessage(msg.username, msg.content);
  });
});

// Receive new chat messages
socket.on('chat message', (msg) => {
  appendMessage(msg.username, msg.content);
});

// Submit new message
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', {
      username: username,
      content: input.value
    });
    input.value = '';
  }
});

// Append message to list
function appendMessage(user, text) {
  const item = document.createElement('li');
  item.innerHTML = `<strong>${user}:</strong> ${text}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}
