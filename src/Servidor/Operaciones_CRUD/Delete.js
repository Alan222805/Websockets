const Operaciones_CRUD = require('./Operaciones_CRUD');
const Connection_DB = require('../../Connection_DB');

const pool = new Connection_DB().pool;

class Delete extends Operaciones_CRUD {
    /**
     *
     */
    constructor(id, organization_id) {
        super(organization_id); // Llamar al constructor de la clase base con el organization_id
        this.id = id; // ID de la notificación que queremos eliminar
    }

    async delete(res) {
        try {
            const result = await pool.query(
                'DELETE FROM notificaciones WHERE id = $1 AND organization_id = $2 RETURNING *',
                [this.id, this.organization_id]
            );
            if (result.rowCount > 0) {
                res.json({ message: 'Notificación eliminada con éxito', data: result.rows });
            } else {
                res.status(404).json({ error: 'Notificación no encontrada' });
            }
        } catch (error) {
            onsole.error('Error al eliminar la notificación:', err);
            res.status(500).json({ error: 'Error al eliminar la notificación' });
        }
    }
}

module.exports = Delete;