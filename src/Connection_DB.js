const { Pool } = require("pg");


class Connection_DB{
    constructor(user, host, database, password, port){
        this.pool = new Pool({
            user: user,
            host: host,
            database: database,
            password: password,
            port: port,
        })
    }
}


module.exports = Connection_DB; // Exportar usando CommonJS