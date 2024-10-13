const Connection_DB = require('../../Connection_DB');

const pool = new Connection_DB().pool;
const db = new Connection_DB();


//Middleware para verificar el token
async function verifyToken(req, res, next){
    //Extraer el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({error: 'Token no proporcionado'})
    }

    try{
        const tokenRecord = await db.findToken(token); //Llamando a la funcion findToken

        if(!tokenRecord){
            return res.status(401).json({error: 'Token invalido o no encontrado'})
        }

        next(); //Continuar si el token es valido
    } catch(err){
        res.status(500).json({error: 'Error al verificar el token'})
    }

    }

module.exports = { verifyToken }; //Exportar usando CommonJS

