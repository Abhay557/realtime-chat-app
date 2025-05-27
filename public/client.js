document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  function appendMessage(username, content) {
    const item = document.createElement('li');
    item.textContent = `${username}: ${content}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  let username = prompt("Enter your name:") || "Anonymous";

  socket.on('chat history', (history) => {
    history.forEach(msg => {
      appendMessage(msg.username, msg.content);
    });
  });

  socket.on('chat message', (msg) => {
    appendMessage(msg.username, msg.content);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() !== '') {
      socket.emit('chat message', {
        username: username,
        content: input.value.trim()
      });
      input.value = '';
    }
  });

  fetch('/messages')
    .then(res => res.json())
    .then(messages => {
      messages.forEach(message => {
        appendMessage(message.username, message.message);
      });
    })
    .catch(err => console.error("Error loading messages:", err));
});
