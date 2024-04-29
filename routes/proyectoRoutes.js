import express from 'express';
import {crearProyecto,actualizarProyecto,listarProyectos, listarProyectosEstadoActivo, obtenerProyectosMesAnio, listarProyectosUsuario} from '../controllers/proyectoController.js';

const router = express.Router()

router.post('/crear',crearProyecto)
router.put('/actualizar/:idProyecto',actualizarProyecto)
router.get('/listar-proyectos',listarProyectos)
router.get('/listar-proyectos-estado-activo', listarProyectosEstadoActivo)
router.get('/obtener-proyectos-mes-anio/:anio', obtenerProyectosMesAnio)
router.get('/listar-proyectos-usuario/:idUsuario',listarProyectosUsuario)

export default router;