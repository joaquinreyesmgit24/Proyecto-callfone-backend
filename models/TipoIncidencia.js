import { DataTypes } from 'sequelize';
import db from '../config/db.js'

const TipoIncidencia = db.define('tiposincidencias',{
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    },
})

export default TipoIncidencia