import { DataTypes } from 'sequelize';
import db from '../config/db.js'

const Incidencia = db.define('incidencias',{
    descripcion:{
        type:DataTypes.STRING,
    },
    estado: {
        type:DataTypes.BOOLEAN
    }
})

export default Incidencia