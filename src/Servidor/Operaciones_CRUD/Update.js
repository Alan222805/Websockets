const Operaciones_CRUD = require('./Operaciones_CRUD');
const Connection_DB = require('../../Connection_DB');
const pool = new Connection_DB().pool;

class Update extends Operaciones_CRUD {

    constructor(id, title, description, organization_id) {
        super(organization_id); // Llamar al constructor de la clase base con el organization_id
        this.id = id; // ID de la notificación que queremos actualizar
        this.title = title; // Nuevo título
        this.description = description; // Nueva descripción
    }

    query() {
        return {
            text: 'UPDATE notificaciones SET nombre = $1, descripcion = $2 WHERE id = $3 AND organization_id = $4 RETURNING *',
            values: [this.title, this.description, this.id, this.organization_id]
        };
    }

    async updateNotification() {
        try {
            const result = await pool.query(this.query());
            
            // Si no se actualizó ninguna fila, lanzar un error
            if (result.rowCount === 0) {
                throw new Error("No se encontró la notificación para modificar"); 
            }

            // Devolver la notificación actualizada
            return result.rows[0]; // Corregir el typo aquí: rows en lugar de row
        } catch (err) {
            console.error('Error al actualizar la notificación:', err);
            // Lanzar un nuevo error con más información
            throw new Error("Error al actualizar la notificación: " + err.message);
        }
    }

    async patch(fieldToUpdate, newValue) {
        try {
            const query = {
                text: `UPDATE notificaciones SET ${fieldToUpdate} = $1 WHERE id = $2 AND organization_id = $3 RETURNING *`,
                values: [newValue, this.id, this.organization_id]
            };

            const result = await pool.query(query);
            if (result.rowCount === 0) {
                throw new Error("No se encontró la notificación para modificar");
            }

            return result.rows[0];
        } catch (err) {
            console.error(`Error al hacer PATCH en el campo ${fieldToUpdate}:`, err);
            throw new Error(`Error al hacer PATCH en el campo ${fieldToUpdate}: ` + err.message);
        }
    }
}

module.exports = Update;