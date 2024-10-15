const socket = io();

// Supongamos que obtienes el organizationId del usuario desde el backend
const organizationId = 'org-1234'

// simulacion de obtencion del token
const token = 'token-3';

// Unirse a la sala de la organización
socket.emit('join_organization', organizationId);

// Funcion para cargar notificaciones anteriores de la base de datos
async function loadPreviousNotifications(){
    try {
        const response = await fetch(`http://localhost:3000/notifications/${organizationId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Incluir el token en la cabecera
                    'Content-Type': 'application/json'
                }
            });
        if (response.status === 401){
            console.error('No autorizado: token invalido o no proporcionado')
            return;
        }

        const notifications = await response.json();

        notifications.forEach(notification => {
            addnotificationToDOM(notification);
        });
    } catch (err) {
        console.error('Error al cargar notificaciones anteriores:', err);
    }
}

// Cargar las notificaciones anteriores al cargar la página
window.onload = () =>{
    loadPreviousNotifications();
};

// Escuchar cuando se crea una nueva tarea
socket.on('new_notification', (notification) => {
    console.log('Nueva notificación recibida:', notification);
    addnotificationToDOM(notification);
});

// Eschucar cuando se elimina una notificacion
socket.on('notification_deleted', (notification) => {
    console.log('Notificacion eliminada: ', notification);
    removeNotificationFromDOM(notification.id);
})

socket.on('notification_updated', (notification) => {
    console.log('Notificacion actualizada', notification);
    updateNotificationOnDOM(notification.id);
})

// Función para agregar tarea al DOM
function addnotificationToDOM(notification) {
    const notificationContainer = document.getElementById('notification-container');

    // Crear el contenedor de la tarea
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    notificationElement.setAttribute('data-id', notification.id);

    // Título de la tarea
    const titleElement = document.createElement('div');
    titleElement.classList.add('notification-title');
    titleElement.textContent = notification.nombre;

    // Descripción de la tarea
    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('notification-description');
    descriptionElement.textContent = notification.descripcion;

    // Id de la organización
    const organizationElement = document.createElement('div');
    organizationElement.classList.add('notification-organizationId');
    organizationElement.textContent = notification.organization_id;

    // Añadir el título y la descripción al contenedor de la notificacion
    notificationElement.appendChild(titleElement);
    notificationElement.appendChild(descriptionElement);
    notificationElement.appendChild(organizationElement);

    // Añadir la nueva tarea al contenedor de tareas
    notificationContainer.appendChild(notificationElement);
}

function removeNotificationFromDOM(notificationId) {
    // Obtener el contenedor que contiene todas las notificaciones
    const notificationContainer = document.getElementById('notification-container');
    
    // Buscar la notificación específica usando el id de la notificación
    const notificationElement = document.querySelector(`.notification[data-id='${notificationId}']`);
    
    // Si se encuentra la notificación, eliminarla del DOM
    if (notificationElement) {
        notificationContainer.removeChild(notificationElement);
    } else {
        console.warn(`No se encontró la notificación con id: ${notificationId}`);
    }
}

function updateNotificationOnDOM(notificationId) {
    const notificationContainer = document.getElementById('notification-container');
    const notificationElement = document.querySelector(`.notification[data-id='${notificationId}']`);

    if (notificationElement) {
        // Título de la tarea
        const titleElement = document.createElement('div');
        titleElement.classList.add('notification-title');
        titleElement.textContent = notification.nombre;

        // Descripción de la tarea
        const descriptionElement = document.createElement('div');
        descriptionElement.classList.add('notification-description');
        descriptionElement.textContent = notification.descripcion;

        // Id de la organización
        const organizationElement = document.createElement('div');
        organizationElement.classList.add('notification-organizationId');
        organizationElement.textContent = notification.organization_id;

        // Añadir el título y la descripción al contenedor de la notificacion
        notificationElement.appendChild(titleElement);
        notificationElement.appendChild(descriptionElement);
        notificationElement.appendChild(organizationElement);

    } else {
        console.warn(`No se encotro la notificacion con id: ${notificationId}`);
    }
}