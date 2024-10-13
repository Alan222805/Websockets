const Operaciones_CRUD = require('./Operaciones_CRUD')

class Create extends Operaciones_CRUD{
    constructor(id, title, description, organization_id){
        super(organization_id)
        this.id = id
        this.title = title
        this.description = description
    }


    query(){
        return {
            text: 'INSERT INTO notificaciones (id, nombre, descripcion, organization_id) VALUES ($1, $2, $3, $4) RETURNING *',
            values: [this.id, this.title, this.description, this.organization_id]
        }; 
    }

    async createNotification(pool, io) {
        try {
            //Insertar una tarea en la base de datos
            const result = await pool.query(
                "INSERT INTO notificaciones (id, nombre, descripcion, organization_id) VALUES ($1,$2, $3, $4) RETURNING *",
                [this.id, this.title, this.description, this.organization_id]
            )

            // Verificar si result.rows está vacío
            if (result.rows.length === 0) {
                console.error('No se devolvieron filas. La inserción falló.');
                throw new Error('La inserción falló, no se devolvieron resultados.');
            }

            //Obtener la tarea creada
            const newNotification = result.rows[0];

            //Emitir la nueva tarea solo a la sala de la organizacion correspondiente
            io.to(this.organization_id).emit('new_notification', newNotification);

            return newNotification; //Retornar la nueva notificacion
        } catch(err){
            //Manejar el error sin que se caiga el servidor
            console.log('Error al crear la notificacion:', err.message);
            throw new Error('Error al crear la notificacion');
        }
    }
    
}

module.exports = Create