const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const Connection_DB = require( './Connection_DB')
const path = require('path')
const { verifyToken } = require('./Servidor/Operaciones_CRUD/TokenVerification') // importando el middleware
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt')

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
})

app.post('/createNotification', authenticateJWT, async (req, res) => {
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


    /* //Leer (Obtener) todos los registros
    socket.on("read", async () =>{
        try{
            const result = await pool.query("SELECT * FROM Notificaciones");
            socket.emit("read_success", result.rows)
        } catch(err){
            console.error("Error al leer:", err);
            socket.emit("error", "Error al leer notificaciones");
        }
    });

    // Actualizar un registro
    socket.on('update', async (data) => {
        try {
            const { id, nombre, descripcion } = data;
            const result = await pool.query(
                'UPDATE Notificaciones SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
                [nombre, descripcion, id]
            );
            socket.emit('update_success', result.rows[0]);
        } catch (err) {
            console.error('Error al actualizar:', err);
            socket.emit('error', 'Error al actualizar notificacion');
        }
    });

    // Eliminar un registro
    socket.on('delete', async (id) => {
        try {
            await pool.query('DELETE FROM Notificaciones WHERE id = $1', [id]);
            socket.emit('delete_success', id);
        } catch (err) {
            console.error('Error al eliminar:', err);
            socket.emit('error', 'Error al eliminar notificacion');
        }
    }); */

});

// Iniciar el servidor
server.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});
