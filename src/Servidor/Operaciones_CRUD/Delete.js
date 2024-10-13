const Operaciones_CRUD = require('./Operaciones_CRUD');
const Connection_DB = require('../../Connection_DB'); // Reutilizar la conexión a la base de datos
const pool = new Connection_DB().pool;

class Delete extends Operaciones_CRUD {

    constructor(notificationId, organization_id) {
        super(organization_id);
        this.notificationId = notificationId;
    }

    // Método para construir la consulta de eliminación
    query() {
        return {
            text: 'DELETE FROM notificaciones WHERE id = $1 AND organization_id = $2 RETURNING *',
            values: [this.notificationId, this.organization_id]  // Usar el id de la notificación y la organización para mayor seguridad
        };
    }

    // Método para eliminar una notificación de la base de datos
    async deleteNotification() {
        try {
            const result = await pool.query(this.query());
            
            // Verificar si se eliminó una fila
            if (result.rowCount === 0) {
                throw new Error('No se encontró la notificación para eliminar');
            }
            return result.rows[0];  // Retornar la fila eliminada para confirmar

        } catch (err) {
            console.error('Error al eliminar la notificación:', err);
            throw new Error('Error al eliminar la notificación');
        }
    }
}

module.exports = Delete;
