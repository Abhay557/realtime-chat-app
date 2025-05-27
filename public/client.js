const socket = io();
let name;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');
const onlineUsersList = document.getElementById('online-users-list');

// Ask for username until given
do {
    name = prompt('Please enter your name: ');
} while (!name);

// Send username to server to register online
socket.emit('user_connected', name);

// Send 'activity' event on user interaction to reset inactivity timer
document.addEventListener('mousemove', () => {
    socket.emit('activity');
});
document.addEventListener('keypress', () => {
    socket.emit('activity');
});

// Listen for online users update from server and update UI
socket.on('online_users', (users) => {
    if (!onlineUsersList) return;
    onlineUsersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.username;
        onlineUsersList.appendChild(li);
    });
});

// Send message on Enter key
textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage(e.target.value);
    }
});

function sendMessage(message) {
    let msg = {
        user: name,
        message: message.trim()
    };
    // Append outgoing message locally
    appendMessage(msg, 'outgoing');
    textarea.value = '';
    scrollToBottom();

    // Send message to server
    socket.emit('message', msg);
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, 'message');

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
}

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Listen for incoming messages from others
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming');
    scrollToBottom();
});
