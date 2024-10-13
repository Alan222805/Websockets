const { Pool } = require("pg");


class Connection_DB{
    constructor(){
        this.pool = new Pool({
            user: "postgres",
            host: "localhost",
            database: "NotificacionesDB",
            password: "AJOVJ222805",
            port: 3306,
        });
    }

    //Metodo para verificar el token en la base de datos
    async findToker(token) {
        const query = 'SELECT * FROM tokens WHERE token = $1';
        try {
            const result = await this.pool.query(query, [token]);
            if(result.rows.length > 0){
                return result.rows[0]; // retorna el registro si el token si existe
            } else{
                return null; // Token no encontrado
            }
        } catch (err){
            console.error('Error al ejecutar la consulta', err);
            throw err; // Lanza error para manejarlo en el middleware
        }
    }
    //Metodo para verificar el token en la base de datos
    async findToken(token) {
        const query = 'SELECT * FROM tokens WHERE token = $1';
        try {
            const result = await this.pool.query(query, [token]);
            if(result.rows.length > 0){
                return result.rows[0]; // retorna el registro si el token si existe
            } else{
                return null; // Token no encontrado
            }
        } catch (err){
            console.error('Error al ejecutar la consulta', err);
            throw err; // Lanza error para manejarlo en el middleware
        }
    }
}


module.exports = Connection_DB; // Exportar usando CommonJS