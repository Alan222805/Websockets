const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const Connection_DB = require( './Connection_DB')
const path = require('path')


//Crear la app de Express
const app = express();
const server = http.createServer(app);

//Configurar socket.io
const io = new Server(server)

// Creando la conexion a la base de datos
const pool = new Connection_DB("sa", "localhost", "test_Notifications", "aaa", 1433).pool;


//Midleware para permitir solicitudes CORS
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Ruta para obtener todas la notificaciones de una organización
app.get("/notifications/:organizationId", async (req, res) =>{
    const { organizationId } = req.params;
    try{
        const result = await pool.query(
            'SELECT * FROM notificaciones WHERE organization_id = $1',
            [organizationId]
        );
        res.json(result.rows);
    } catch(err){
        console.error('Error al obtener notificaciones:', err);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
})


// Configura la carpeta 'Cliente' como carpeta estática
app.use(express.static(path.join(__dirname, '/Cliente')));

app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, "/Cliente/index.html"));
});
app.get("/administrador", (req, res) =>{
    res.sendFile(__dirname + "/administrador.html");
});

//Manejar conexiones de socket.io
io.on("connection", socket =>{
    console.log("Usuario conectado:", socket.id);

    // Cuando un usuario se conecta, el cliente le envía su organización
    socket.on("join_organization", organizationId =>{
        socket.join(organizationId); // Añadir al usuario a  la sala de su organización
        console.log("Usuario añadido a la organización: " + organizationId);
    });
    
    // Crear (Insertar) un registro como administrador
    socket.on("create", async data=>{
        try{
            const { id, nombre, descripcion, organizationId } = data;
            const result = await pool.query(
                "INSERT INTO notificaciones (id, nombre, descripcion, organization_id) VALUES ($1, $2, $3, $4) RETURNING *",
                [id, nombre, descripcion, organizationId]    
            );

            //Notificar al cliente la nueva tarea
            const newNotification = result.rows[0];
            // io.emit("new_notification", newNotification); 
            
            // Emiti a todos los clientes conectados
            socket.emit("create_success");

            //Emitir la nueva notificacion solo a la sala de la organización correspondiente
            io.to(organizationId).emit("new_notification", newNotification)

        } catch(err){
            console.error("Error al crear:", err)
            socket.emit("error", "Error al crear notificación");
        }
    });


    //Leer (Obtener) todos los registros
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
    });

});

// Iniciar el servidor
server.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});
