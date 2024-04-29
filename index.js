import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import contactoRoutes from './routes/contactoRoutes.js';
import telefonoRoutes from './routes/telefonoRoutes.js'
import incidenciaRoutes from './routes/incidenciaRoutes.js'
import db from './config/db.js';

//Crear la app
const app = express()

app.use(morgan('tiny'))
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//Habilitar Cookie Parser
app.use(cookieParser())

//Conexión a la base de datos
try{
    await db.authenticate();
    console.log('Conexión correcta a la base de datos')
}catch(e){
    console.log(e)
}

app.use('/auth', usuarioRoutes)
app.use('/proyecto', proyectoRoutes)
app.use('/contacto', contactoRoutes)
app.use('/telefono', telefonoRoutes)
app.use('/incidencia', incidenciaRoutes)




const port = 3000;

app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});