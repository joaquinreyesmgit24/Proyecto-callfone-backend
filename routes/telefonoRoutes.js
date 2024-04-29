import express from 'express';
import {listarTelefonosProyectoUsuario, finalizarTelefono, listarTelefonosContacto} from '../controllers/telefonoController.js';

const router = express.Router()

router.get('/listar-telefonos-proyecto/:idUsuario/:idProyecto',listarTelefonosProyectoUsuario)
router.put('/finalizar-telefono/:idTelefono',finalizarTelefono)
router.get('/listar-telefonos-contacto/:idContacto',listarTelefonosContacto )

export default router;