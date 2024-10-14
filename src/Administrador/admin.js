const socket = io('http://localhost:3000');

// Seleccionar el formulario y el mensaje de éxito/error
const form = document.getElementById('create-notification-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.83DmfZv0PWAjcg0U9IJpmgq-SGi_usPqpB1O4PaMQRI'

// Manejar el envío del formulario
form.addEventListener('submit', (event) => {
    event.preventDefault();  // Evitar recargar la página

    // Obtener los valores del formulario
    const id = Number(document.getElementById('id').value);
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const organizationId = document.getElementById("organizationId").value;

    //Enviar los datos al servidor a traves de una solicitud POST
    fetch('http://localhost:3000/createNotification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, nombre, descripcion, organizationId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Mostrar mensaje de error
            errorMessage.textContent = data.error;
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        } else {
            // Mostrar mensaje de éxito y limpiar el formulario
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            form.reset();
        }
    })
    .catch((err) => {
        console.error('Error al enviar la solicitud:', err);
        errorMessage.textContent = 'Error al enviar la solicitud.';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    });
});