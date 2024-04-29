import Sequelize from 'sequelize'
import dotenv from 'dotenv'
dotenv.config({path:'.env'})

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER,process.env.BD_PASS ?? '',{
    host: process.env.BD_HOST,
    port: '3307',
    dialect: 'mysql',
    define:{
        timestamps:true
    },
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    },
    operatorAliases:false 
})

db.sync().then(()=>{
    console.log('Modelo sincronizado con la base de datos')
}).catch(err=>{
    console.error('Error al sincronizar modelo:',err)
})


export default db