document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  // Function to append message to the messages list
  function appendMessage(username, content) {
    const item = document.createElement('li');
    item.textContent = `${username}: ${content}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight; // Scroll to bottom
  }

  // Prompt for username
  let username = prompt("Enter your name:") || "Anonymous";

  // Receive chat history from server
  socket.on('chat history', (history) => {
    history.forEach(msg => {
      appendMessage(msg.username, msg.content);
    });
  });

  // Receive new chat messages from server
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

  // Fetch existing messages from server API and append
  fetch('/messages')
    .then(res => res.json())
    .then(messages => {
      messages.forEach(message => {
        appendMessage(message.username, message.message);
      });
    })
    .catch(err => console.error("Error loading messages:", err));
});
