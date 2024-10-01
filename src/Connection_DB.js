const sql = require('mssql');

class Connection_DB {
    constructor(user, host, database, password, port) {
        this.config = {
            user: user,
            password: password,
            server: host,
            database: database,
            port: port,
            options: {
                encrypt: false, // Requerido para Azure
                trustServerCertificate: true // Requerido si no estás usando un certificado SSL
            }
        };

        // Crear la conexión con la base de datos
        this.pool = new sql.ConnectionPool(this.config);
        this.pool.connect().then(() => {
            console.log('Conexión exitosa a SQL Server');
        }).catch(err => {
            console.log('Error al conectar con SQL Server: ', err);
        });
    }
}

module.exports = Connection_DB;