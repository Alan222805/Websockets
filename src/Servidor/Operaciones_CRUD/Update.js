const Operaciones_CRUD = require('./Operaciones_CRUD');
const Connection_DB = require('../../Connection_DB');

const pool = new Connection_DB("postgres", "localhost", "NotificacionesDB", "AJOVJ222805", 3306).pool;

class Update extends Operaciones_CRUD {
    /**
     *
     */
    constructor(id, title, description, organization_id) {
        super(organization_id); // Llamar al constructor de la clase base con el organization_id
        this.id = id; // ID de la notificación que queremos actualizar
        this.title = title; // Nuevo título
        this.description = description; // Nueva descripción
    }

    async update(res) {
        try {
            const query = await pool.query(
                'UPDATE notificaciones SET nombre = $1, descripcion = $2 WHERE id = $3 AND organization_id = $4 RETURNING *',
                [this.title, this.description, this.id, this.organization_id]
            );
            res.json(result.rows)
        } catch (error) {
            console.error('Error al actualizar la notificación:', err);
            res.status(500).json({ error: 'Error al actualizar la notificación' });
        }
    }
}

module.exports = Update;