const socket = io('http://localhost:3000');

// Seleccionar el formulario y el mensaje de éxito/error
const form = document.getElementById('create-notification-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Manejar el envío del formulario
form.addEventListener('submit', (event) => {
event.preventDefault();  // Evitar recargar la página

// Obtener los valores del formulario
const id = Number(document.getElementById('id').value);
const nombre = document.getElementById('nombre').value;
const descripcion = document.getElementById('descripcion').value;
const organizationId = document.getElementById("organizationId").value;

// Enviar los datos al servidor a través de socket.io
socket.emit('create', { id, nombre, descripcion, organizationId });

// Manejar la respuesta del servidor
socket.on('create_success', (notification) => {
    // Mostrar mensaje de éxito y limpiar el formulario
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    form.reset();
});

socket.on('error', (message) => {
    // Mostrar mensaje de error
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
});
});