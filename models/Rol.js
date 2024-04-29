import { DataTypes } from 'sequelize';
import db from '../config/db.js'

const Rol = db.define('roles',{
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

export default Rol