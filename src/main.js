const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const Connection_DB = require( './Connection_DB')
const path = require('path')
const { verifyToken } = require('./Servidor/Operaciones_CRUD/TokenVerification') // importando el middleware
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt')
const swaggerApp = require('./Servidor/Swagger')

const secretKey = 'alantoken'

//Middleware para verificar el token JWT
const authenticateJWT = expressJwt({ secret: secretKey, algorithms: ['HS256']})

//Importando las clases para el CRUD
const Create = require('./Servidor/Operaciones_CRUD/Create')
const Read = require('./Servidor/Operaciones_CRUD/Read')
const Delete = require('./Servidor/Operaciones_CRUD/Delete')
const Update = require('./Servidor/Operaciones_CRUD/Update')

//Crear la app de Express
const app = express();
const server = http.createServer(app);

//Configurar socket.io
const io = new Server(server)

// Configurando las carpetas 'Cliente' y 'Administrador' como carpeta estática
app.use(express.static(path.join(__dirname, '/Cliente')));
app.use(express.static(path.join(__dirname, '/Administrador')));

//Pagina principal en que se muestran las notificaciones
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, "/Cliente/index.html"));
});

//Ruta del formulario para crear notificaciones
app.get("/administrador", (req, res) =>{
    res.sendFile(__dirname + "/Administrador/administrador.html");
});

// Creando la conexion a la base de datos
const pool = new Connection_DB().pool


//Midleware para permitir solicitudes CORS
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(swaggerApp);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtiene todas las notificaciones
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *       401:
 *         description: No autorizado
 */

//Ruta para obtener todas las notificaciones
app.get("/notifications",authenticateJWT, async (req, res) => {
    const read = new Read();
    read.read_all(res)
});

// Ruta para obtener todas la notificaciones de una organización
app.get("/notifications/:organizationId", authenticateJWT,  async (req, res) =>{
    const { organizationId } = req.params;
    const read = new Read(organizationId)
    read.read_specific(res)
});

/**
 * @swagger
 * /notifications/create:
 *   post:
 *     summary: Crea una nueva notificación
 *     tags: [Notificaciones]
 *     security:
 *          - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               organizationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notificación creada exitosamente
 *       400:
 *         description: Error en la solicitud
 */

app.post('/notifications/create', authenticateJWT, async (req, res) => {
    try{
        const {id, nombre, descripcion, organizationId} = req.body;
        
        const create = new Create(id, nombre, descripcion, organizationId);
        const newNotification = await create.createNotification(pool, io);
        res.status(201).json(newNotification);
    }catch(err){
        console.error('Error en el endpoint:', err.message); // Imprime el mensaje de error
        res.status(500).json({error: ' catch main.js --> Error al crear la notificacion'})
    }
})

//Manejar conexiones de socket.io
io.on("connection", socket =>{
    // console.log("Usuario conectado:", socket.id);

    // Cuando un usuario se conecta, el cliente le envía su organización
    socket.on("join_organization", organizationId =>{
        socket.join(organizationId); // Añadir al usuario a  la sala de su organización
        console.log("Usuario añadido a la organización: " + organizationId);
    });
    
    // Crear (Insertar) un registro como administrador
    socket.on("create", async data=>{
        try{
            const {id, nombre, descripcion, organizationId} = data;
            const create = new Create(id, nombre, descripcion, organizationId);

            await create.createNotification(pool, io, socket.id);
        }catch(err){
            console.error(err.message);
        }
    });
    

    socket.on("update", async data=>{
        try {
            const { id, newTitle, newDescription, organizationId } = data;
            const update = new Update(id, newTitle, newDescription, organizationId);
            update.update(res);
        } catch (error) {
            console.error("Error al actualizar: ", err);
            socket.emit("error", "Error al actualizar notificación");
        }
    });

    socket.on("delete", async data=>{
        try {
            const { id, organization_id } = data;
            const del = new Delete(id, organization_id);
            del.delete(res);
        } catch (error) {
            console.error("Error al eliminar: ", err);
            socket.emit("error", "Error al eliminar notificación");
        }
    });
});

// Endpoints para el CRUD

app.delete('/notifications/delete', authenticateJWT, async (req, res) => {
    try {
        const { id, organizationId } = req.body;
        const operation = new Delete(id, organizationId);
        const deletedNotification = await operation.deleteNotification(pool);
        res.status(200).json(deletedNotification);
        io.to(organizationId).emit("notification_deleted", deletedNotification);

    } catch (error) {
        console.error("Error al eliminar la notificación:", error);
        res.status(500).json({ error: "Error al eliminar la notificación" });
    }
});

app.put('/notifications/update', authenticateJWT, async (req, res) => {
    try {
        const { id, nombre: title, descripcion: description, organizationId } = req.body;
        const operation = new Update(id, title, description, organizationId);
        const updatedNotification = await operation.updateNotification(pool);
        res.status(200).json(updatedNotification);
        io.to(organizationId).emit("notification_updated", updatedNotification);

    } catch (error) {
       console.error("Error al modificar la notificacion: ", error);
       res.status(500).json({ error: "Error al modificar la notificacion"});
    }
});

app.patch('/notifications/patch', authenticateJWT, async (req, res) => {
    try {
        const { id, organizationId, fieldToUpdate, newValue } = req.body;

        if (!['nombre', 'descripcion'].includes(fieldToUpdate)) {
            return res.status(400).json({ error: "Campo no válido para actualizar" });
        }

        const operation = new Update(id, null, null, organizationId); // Sólo necesitamos el id y el organizationId
        const updatedNotification = await operation.patch(fieldToUpdate, newValue, pool);

        res.status(200).json(updatedNotification);
        io.to(organizationId).emit("notification_updated", updatedNotification);

    } catch (err) {
        console.error("Error al hacer PATCH en la notificación:", err);
        res.status(500).json({ error: "Error al actualizar parcialmente la notificación" });
    }
});


// Iniciar el servidor
server.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});
