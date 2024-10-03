let countingInterval;
let seconds = 0;
let mediaRecorder;
let audioChunks = [];
let micPermissionGranted = false;  // Variable para controlar si ya se otorgó el permiso del micrófono

document.addEventListener("DOMContentLoaded", function () {
  const micBtn = document.getElementById('mic-btn');
  const chatBtn = document.querySelector('.chatbot-btn');
  const closeBtn = document.querySelector('.close-btn');  // Botón para cerrar el chatbot
  const sendBtn = document.getElementById('send-btn');
  const preloadedBtns = document.querySelectorAll('.preloaded-messages button');

  // Evento para abrir/cerrar el chatbot
  chatBtn.addEventListener('click', toggleChatbot);
  closeBtn.addEventListener('click', toggleChatbot);  // Añadir evento para cerrar el chatbot

  // Evento para reiniciar el chatbot
  document.querySelector('.restart-btn').addEventListener('click', restartChat);

  // Evento para enviar mensajes predefinidos
  preloadedBtns.forEach(button => {
    button.addEventListener('click', () => sendPreloadedMessage(button.textContent));
  });

  // Escuchar los eventos mousedown y mouseup en el botón del micrófono
  micBtn.addEventListener('mousedown', startCounting);
  micBtn.addEventListener('mouseup', stopCounting);

  // Manejo para cuando el mouse se mueva fuera del botón del micrófono
  micBtn.addEventListener('mouseleave', stopCounting);

  // Evento para enviar un mensaje cuando se presione el botón de enviar
  sendBtn.addEventListener('click', sendMessage);

  // Evento para enviar mensaje con la tecla Enter
  document.getElementById('user-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
});

function toggleChatbot() {
  const chatbot = document.getElementById('chatbot');
  if (chatbot.style.display === 'none' || chatbot.style.display === '') {
    chatbot.style.display = 'flex';
  } else {
    chatbot.style.display = 'none';
  }
}

function toggleSendButton() {
  const input = document.getElementById('user-input').value;
  const sendBtn = document.getElementById('send-btn');
  sendBtn.disabled = input.trim().length === 0;
}

function sendPreloadedMessage(message) {
  sendMessage(message);
}

function sendMessage(preloadedMessage = null) {
  const input = document.getElementById('user-input');
  const chatBody = document.getElementById('chat-body');
  const messageText = preloadedMessage ? preloadedMessage : input.value.trim();

  if (messageText.length > 0) {
    // Eliminar el mensaje inicial y los botones de mensajes precargados
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
      initialMessage.remove();
    }

    // Agregar el mensaje del usuario alineado a la derecha
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = messageText;
    chatBody.appendChild(userMessage);

    // Limpiar el input
    input.value = '';
    toggleSendButton();

    // Verificar si el mensaje del usuario contiene las palabras clave
    const keywords = ['imagen', 'foto', 'producto'];
    const containsKeyword = keywords.some(keyword => messageText.toLowerCase().includes(keyword));

    if (containsKeyword) {
      // Responder con el mensaje y renderizar el cuadro del producto
      setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'bot-message';
        botMessage.textContent = 'Este es el producto que buscas?';
        chatBody.appendChild(botMessage);

        // Crear el cuadro del producto clicable
        const productBox = document.createElement('div');
        productBox.style.width = '100px';
        productBox.style.height = '100px';
        productBox.style.backgroundColor = '#BABABA';
        productBox.style.marginTop = '10px';
        productBox.style.borderRadius = '5px';
        productBox.style.cursor = 'pointer';  // Hacer el cuadro clicable
        productBox.onclick = showProductView;  // Abrir la vista de producto al hacer clic
        chatBody.appendChild(productBox);

        // Desplazar hacia abajo para ver el nuevo mensaje
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 500);
    } else {
      // Si no hay palabra clave, responde con un mensaje genérico
      setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'bot-message';
        botMessage.textContent = 'Message received';
        chatBody.appendChild(botMessage);

        // Desplazar hacia abajo para ver el nuevo mensaje
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 500);
    }
  }
}

function restartChat() {
  const chatBody = document.getElementById('chat-body');
  chatBody.innerHTML = `
    <div id="initial-message">
      <p>Hi, I'm your shopping assistant. I can help you with...</p>
      <div class="preloaded-messages">
        <button onclick="sendPreloadedMessage('Help me find a gift')">Help me find a gift</button>
        <button onclick="sendPreloadedMessage('I want vegan products')">I want vegan products</button>
        <button onclick="sendPreloadedMessage('I am looking for running shoes')">I am looking for running shoes</button>
      </div>
    </div>
  `;
}

function startCounting() {
  const micBtn = document.getElementById('mic-btn');
  const micIcon = micBtn.querySelector('i');
  const userInput = document.getElementById('user-input');

  // Cambiar el ícono del micrófono a rojo y el botón activo
  micBtn.classList.add('active');
  micIcon.style.color = 'red';  // Cambiar el ícono a rojo

  // Iniciar el contador solo si no está ya corriendo
  if (!countingInterval) {
    countingInterval = setInterval(() => {
      seconds++;
      userInput.value = formatSeconds(seconds);  // Mostrar el contador en el input
      userInput.classList.add('active');  // Aplicar estilo activo al input
    }, 1000);
  }
}

function stopCounting() {
  const micBtn = document.getElementById('mic-btn');
  const micIcon = micBtn.querySelector('i');
  const userInput = document.getElementById('user-input');

  // Detener el contador
  if (countingInterval) {
    clearInterval(countingInterval);
    countingInterval = null;  // Reiniciar el intervalo para evitar múltiples inicios
    seconds = 0;
  }

  // Restaurar el estado inicial del ícono y el input
  micBtn.classList.remove('active');
  micIcon.style.color = 'white';  // Restaurar el ícono a blanco
  userInput.value = '';  // Limpiar el input
  userInput.classList.remove('active');  // Remover el estilo activo del input

  // Solicitar acceso al micrófono solo la primera vez
  if (!micPermissionGranted) {
    requestMicAccess();
  }
}

function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;  // Formato mm:ss
}

// Solicitar acceso al micrófono solo la primera vez
async function requestMicAccess() {
  try {
    // Pedir acceso al micrófono
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('Permiso de micrófono otorgado.');
    micPermissionGranted = true;  // Marcamos que ya se otorgó el permiso

    // Después de obtener los permisos, enumerar los dispositivos
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach(device => {
      console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
    });
  } catch (err) {
    console.error('Error al obtener permisos para el micrófono:', err);
  }
}

// Función para iniciar la grabación de audio
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);  // Guardar el audio en un array temporal
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });  // Crear el Blob temporal
    audioChunks = [];  // Limpiar los chunks después de detener la grabación
    transcribeAudio(audioBlob);  // Enviar el Blob a Whisper para transcripción
  };

  mediaRecorder.start();
}

// Función para detener la grabación de audio
function stopRecording() {
  mediaRecorder.stop();
}

// Función para enviar el audio a Whisper y obtener la transcripción
async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");  // Enviar el Blob de audio
  formData.append("model", "whisper-1");

  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_OPENAI_API_KEY`,  // Coloca tu API Key de OpenAI aquí
      },
      body: formData,
    });

    const data = await response.json();
    const transcribedText = data.text;  // Recibir el texto transcrito de Whisper
    console.log("Texto transcrito: ", transcribedText);
    showTranscriptionInChat(transcribedText);  // Mostrar la transcripción en el chat
  } catch (error) {
    console.error("Error al transcribir el audio:", error);
  }
}

// Función para mostrar la transcripción en el chat
function showTranscriptionInChat(transcribedText) {
  const chatBody = document.getElementById('chat-body');

  // Eliminar el mensaje inicial y los botones de mensajes precargados, si están presentes
  const initialMessage = document.getElementById('initial-message');
  if (initialMessage) {
    initialMessage.remove();
  }

  // Agregar el mensaje del usuario con el texto transcrito alineado a la derecha
  const userMessage = document.createElement('div');
  userMessage.className = 'user-message';
  userMessage.textContent = transcribedText;  // Mostrar el texto transcrito
  chatBody.appendChild(userMessage);

  // Desplazar hacia abajo para ver el nuevo mensaje
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Función para mostrar la vista de producto
function showProductView() {
  const chatBody = document.getElementById('chat-body');
  chatBody.innerHTML = `
    <div class="product-view">
      <button class="back-btn" onclick="backToChat()">← Back</button>
      <div class="product-box" style="background-color: #FFFFFF; width: 300px; height: 300px;"></div>
      <p class="product-name">Nombre del producto</p>
      <p class="product-price">$123.00</p>
      <p class="product-description-heading">Descripción</p>
      <p class="product-description-body">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum. Nulla facilisi. Sed cursus ante dapibus diam.</p>
      <div class="quantity-section">
        <span class="quantity-label">Quantity</span>
        <div class="quantity-btns">
          <button class="quantity-btn" onclick="decreaseQuantity()">-</button>
          <span id="quantity-value">1</span>
          <button class="quantity-btn" onclick="increaseQuantity()">+</button>
        </div>
      </div>
      <button class="add-to-cart-btn">Add to cart</button>
    </div>
  `;
}

// Función para regresar a la vista principal del chatbot
function backToChat() {
  restartChat();  // Volver al inicio del chat
}

// Función para aumentar la cantidad del producto
function increaseQuantity() {
  const quantityValue = document.getElementById('quantity-value');
  let quantity = parseInt(quantityValue.textContent);
  quantity++;
  quantityValue.textContent = quantity;
}

// Función para disminuir la cantidad del producto
function decreaseQuantity() {
  const quantityValue = document.getElementById('quantity-value');
  let quantity = parseInt(quantityValue.textContent);
  if (quantity > 1) {
    quantity--;
    quantityValue.textContent = quantity;
  }
}