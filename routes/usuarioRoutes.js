import express from 'express';
import {registrar,autenticar,cerrarSesion, listarUsuarios, actualizarUsuario,listarRoles,listarUsuariosAsignadosProyecto,listarUsuariosNoAsignadosProyecto, cargarUsuariosProyecto, eliminarUsuariosProyecto, obtenerPorcentajeUsuariosAyNAProyecto} from '../controllers/usuarioController.js';

const router = express.Router()

router.post('/registro',registrar)
router.post('/cerrar-sesion',cerrarSesion)
router.post('/autenticar',autenticar)
//Almacena el nuevo password
router.get('/listar-usuarios',listarUsuarios)
router.put('/actualizar/:idUsuario',actualizarUsuario)
router.get('/listar-roles',listarRoles)
router.get('/listar-usuarios-asignados-proyecto/:idProyecto',listarUsuariosAsignadosProyecto)
router.get('/listar-usuarios-noasignados-proyecto/:idProyecto',listarUsuariosNoAsignadosProyecto)
router.get('/obtener-porcentaje-asignado-noasignados-proyecto/:idProyecto',obtenerPorcentajeUsuariosAyNAProyecto)
router.post('/cargar-usuarios-proyecto/:idProyecto',cargarUsuariosProyecto)
router.post('/eliminar-usuarios-proyecto/:idProyecto',eliminarUsuariosProyecto)


export default router;