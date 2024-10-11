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
            if (result.rowCount > 0) {
                res.json({ message: 'Notificación actualizada con éxito', data: result.rows });
            } else {
                res.status(404).json({ error: 'Notificación no encontrada' });
            }
        } catch (error) {
            console.error('Error al actualizar la notificación:', err);
            res.status(500).json({ error: 'Error al actualizar la notificación' });
        }
    }

    async patch(fieldsToUpdate, res) {
        try {
            const fields = Object.keys(fieldsToUpdate);
            const values = Object.values(fieldsToUpdate);
            const setString = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        
            values.push(this.organization_id, this.id);

            const result = await pool.query(
                'UPDATE notificaciones SET ${setString} WHERE organization_id = $${fields.length + 1} AND id = $${fields.length + 2} RETURNING *',
                values
            );
            if (result.rowCount > 0) {
                res.json({ message: 'Notificación actualizada parcialmente con éxito', data: result.rows });
            } else {
                res.status(404).json({ error: 'Notificación no encontrada' });
            }
        } catch (error) {
            console.error('Error al actualizar parcialmente la notificación:', err);
            res.status(500).json({ error: 'Error al actualizar parcialmente la notificación' });
        }
    }
}

module.exports = Update;