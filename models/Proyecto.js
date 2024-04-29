import { DataTypes } from 'sequelize';
import db from '../config/db.js'


const Proyecto = db.define('proyectos',{
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    },
    numero_llamada_dia:{
        type: DataTypes.INTEGER
    },
    hora_inicio_llamada:{
        type: DataTypes.TIME
    },
    hora_termino_llamada:{
        type: DataTypes.TIME
    },
    fecha_inicio_llamada:{
        type: DataTypes.DATE
    },
    fecha_termino_llamada:{
        type: DataTypes.DATE
    },
    estado: {
        type:DataTypes.BOOLEAN
    }
})

export default Proyecto