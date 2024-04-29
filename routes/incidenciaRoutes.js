import express from 'express';
import {listarTiposIncidencias, crearIncidencia, listarIndicenciasTelefono,actualizarIncidencia} from '../controllers/incidenciaController.js';

const router = express.Router()

router.get('/listar-tipos-incidencias', listarTiposIncidencias)
router.post('/crear/:idTelefono', crearIncidencia)
router.put('/actualizar/:idIncidencia', actualizarIncidencia)
router.get('/listar-incidencias-contacto-telefono/:idTelefono', listarIndicenciasTelefono)


export default router