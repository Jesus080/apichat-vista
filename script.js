document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const messageForm = document.getElementById('message-form');
  const messagesDiv = document.getElementById('messages');
  const authDiv = document.getElementById('auth');
  const chatDiv = document.getElementById('chat');
  let currentUser = null;

  // Manejar el registro de usuario
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('https://chatserver-smpb.onrender.com/auth/register', {
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

  // Manejar el inicio de sesión de usuario
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('https://chatserver-smpb.onrender.com/auth/login', {
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

  // Obtener y mostrar mensajes
  function loadMessages() {
    fetch('https://chatserver-smpb.onrender.com/api/messages')
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

  // Polling largo para nuevos mensajes
  function pollMessages() {
    fetch('https://chatserver-smpb.onrender.com/api/messages/long-poll')
      .then(response => response.json())
      .then(newMessage => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${newMessage.username}: ${newMessage.message}`;
        messagesDiv.appendChild(messageElement);
        pollMessages(); // Llamar recursivamente para continuar el polling
      })
      .catch(() => {
        setTimeout(pollMessages, 5000); // Reintentar después de 5 segundos si hay un error
      });
  }

  pollMessages(); // Iniciar el polling largo

  // Enviar un nuevo mensaje
  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!currentUser) {
      alert('Debes estar registrado para enviar mensajes');
      return;
    }

    const message = document.getElementById('message').value;

    fetch('https://chatserver-smpb.onrender.com/api/messages', {
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
