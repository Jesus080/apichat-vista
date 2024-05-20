document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const messageForm = document.getElementById('message-form');
  const messagesDiv = document.getElementById('messages');
  const authDiv = document.getElementById('auth');
  const chatDiv = document.getElementById('chat');
  let currentUser = null;

  // Handle user registration
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        alert('Usuario registrado correctamente');
      }
    });
  });

  // Handle user login
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        currentUser = data.user;
        authDiv.style.display = 'none';
        chatDiv.style.display = 'block';
        loadMessages();
      }
    });
  });

  // Fetch and display messages
  function loadMessages() {
    fetch('/api/messages')
      .then(response => response.json())
      .then(messages => {
        messagesDiv.innerHTML = '';
        messages.forEach(msg => {
          const messageElement = document.createElement('div');
          messageElement.textContent = `${msg.username}: ${msg.message}`;
          messagesDiv.appendChild(messageElement);
        });
      });
  }

  // Long polling for new messages
  function pollMessages() {
    fetch('/api/messages/long-poll')
      .then(response => response.json())
      .then(newMessage => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${newMessage.username}: ${newMessage.message}`;
        messagesDiv.appendChild(messageElement);
        pollMessages(); // Recursively call to keep polling
      })
      .catch(() => {
        setTimeout(pollMessages, 5000); // Retry after 5 seconds if there's an error
      });
  }

  pollMessages(); // Start long polling

  // Submit a new message
  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!currentUser) {
      alert('Debes estar registrado para enviar mensajes');
      return;
    }

    const message = document.getElementById('message').value;

    fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: currentUser.username, message })
    })
    .then(response => response.json())
    .then(() => {
      document.getElementById('message').value = '';
    });
  });
});
