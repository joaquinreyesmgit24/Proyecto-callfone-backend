import express from 'express';
import multer from 'multer';
import {listarContactosPorProyecto, cargarContactosProyecto, actualizarContacto, crearContacto} from '../controllers/contactoController.js';

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage()}).single('file');

router.get('/listar-contactos/:idProyecto',listarContactosPorProyecto)
router.post('/cargar-contactos-proyecto/:idProyecto',upload,cargarContactosProyecto)
router.put('/actualizar/:idContacto/:idProyecto',actualizarContacto)
router.post('/crear/:idProyecto',crearContacto)


export default router;