const { text } = require('express')
const Operaciones_CRUD = require('./Operaciones_CRUD')

const Connection_DB = require('../../Connection_DB');
const pool = new Connection_DB().pool

class Read extends Operaciones_CRUD{
    constructor(organization_id){
        super(organization_id)
    }


    async read_specific(res, pool){
        try{
            const result = await pool.query(
                'SELECT * FROM notificaciones WHERE organization_id = $1',
                [this.organization_id]
            );
            res.json(result.rows);
        } catch(err){
            console.error('Error al obtener notificaciones:', err);
            res.status(500).json({ error: 'Error al obtener notificaciones' });
        }
    }

    async read_all(res, pool){
        try {
            const result = await pool.query(
                'SELECT * FROM notificaciones'
            );
            res.json(result.rows);
        } catch (err) {
            console.error('Error al obtener notificaciones:', err);
            res.status(500).json({ error: 'Error al obtener notificaciones' });
        }
    }
}

module.exports = Read