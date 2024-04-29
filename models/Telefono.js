import { DataTypes } from 'sequelize';
import db from '../config/db.js'


const Telefono = db.define('telefonos',{
    telefono: {
        type:DataTypes.STRING,
    },
    orden:{
        type:DataTypes.INTEGER
    },
    estado:{
        type:DataTypes.BOOLEAN
    },
})
export default Telefono