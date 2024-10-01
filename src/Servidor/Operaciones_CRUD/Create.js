const Operaciones_CRUD = require('./Operaciones_CRUD')
const express = require('express')
const http = require('http')

const app = express()


class Create extends Operaciones_CRUD{
    constructor(id, title, description, organization_id){
        super(organization_id)
        this.id = id
        this.title = title
        this.description = description
    }


    query(){
        return {
            text: 'INSERT INTO notificaciones (id, nombre, descripcion, organization_id) VALUES ($1, $2, $3, $4) RETURNING *',
            values: [this.id, this.title, this.description, this.organization_id]
        }; 
    }


    
}

module.exports = Create