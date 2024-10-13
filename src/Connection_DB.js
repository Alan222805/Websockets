const { Pool } = require("pg");


class Connection_DB{
    constructor(){
        this.pool = new Pool({
            user: "postgres",
            host: "localhost",
            database: "NotificacionesDB",
            password: "AJOVJ222805",
            port: 3306,
        })
    }
}


module.exports = Connection_DB; // Exportar usando CommonJS