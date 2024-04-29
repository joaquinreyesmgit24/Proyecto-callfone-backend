import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt'
import db from '../config/db.js'

const Usuario = db.define('usuarios',{
    nombre:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    estado:{
        type:DataTypes.BOOLEAN
    }
},{
    hooks:{
        beforeCreate:async function(usuario){
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash(usuario.password, salt);
            
        }
    }
})
//Métodos Personalizados
Usuario.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password,this.password)
}

export default Usuario