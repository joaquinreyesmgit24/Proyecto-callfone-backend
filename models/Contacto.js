import { DataTypes } from 'sequelize';
import db from '../config/db.js'


const Contacto = db.define('contactos',{
    id_data:{
        type:DataTypes.STRING,
        allowNull:false
    },
    region:{
        type:DataTypes.STRING,
    },
    sede: {
        type:DataTypes.STRING
    },
    titulacion: {
        type:DataTypes.INTEGER
    },
    nivel: {
        type:DataTypes.STRING
    },
    escuela: {
        type:DataTypes.STRING
    },
    carrera: {
        type:DataTypes.STRING
    },
    jornada: {
        type:DataTypes.STRING
    },
    rut: {
        type:DataTypes.STRING
    },
    segmento: {
        type:DataTypes.INTEGER
    },
    nombre: {
        type:DataTypes.STRING
    },
    sexo: {
        type:DataTypes.STRING
    },
    estado: {
        type:DataTypes.BOOLEAN
    }
})
export default Contacto