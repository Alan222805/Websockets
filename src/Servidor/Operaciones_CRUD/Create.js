const Operaciones_CRUD = require('./Operaciones_CRUD');
const Connection_DB = require('../../Connection_DB'); // Reutilizar la conexión a la base de datos
const pool = new Connection_DB().pool;

class Create extends Operaciones_CRUD {

    constructor(id, title, description, organization_id) {
        super(organization_id);
        this.id = id;
        this.title = title;
        this.description = description;
    }

    // Método para construir la consulta de inserción
    query() {
        return {
            text: 'INSERT INTO notificaciones (id, nombre, descripcion, organization_id) VALUES ($1, $2, $3, $4) RETURNING *',
            values: [this.id, this.title, this.description, this.organization_id]
        };
    }

    // Método para crear una notificación en la base de datos
    async createNotification() {
        try {
            // Ejecutar la consulta y retornar el resultado
            const result = await pool.query(this.query());
            return result.rows[0];  // Retornar la fila recién creada
        } catch (err) {
            console.error('Error al crear la notificación:', err);
            throw new Error('Error al crear la notificación');
        }
    }
}

module.exports = Create;
