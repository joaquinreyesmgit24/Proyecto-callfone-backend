import { check, validationResult } from 'express-validator'
import { Sequelize, Contacto, Proyecto, ProyectoUsuario, Telefono } from '../models/index.js'
import db from '../config/db.js'
import xlsx from 'xlsx';


const listarContactosPorProyecto = async (req, res) => {
    const { idProyecto } = req.params;
    try {
        const contactos = await Contacto.findAll({
            where: {
                proyectoId: idProyecto,
            },
            include: [
                {
                    model: Telefono,
                    required:true
                }]
        });
        res.status(200).json({ contactos });
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los contactos' });
    }
}
const cargarContactosProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params;
        const buffer = req.file.buffer;
        const contactosData = parsearXLSX(buffer, idProyecto);
        if (!contactosData) {
            return res.status(400).json({ error: 'Formato de archivo no compatible' });
        }
        // Inserta los proyectos en la base de datos
        await Contacto.bulkCreate(contactosData);

        res.status(200).json({ msg: 'Proyectos guardados exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al procesar el archivo' });
    }
}
function parsearXLSX(buffer, idProyecto) {
    try {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        const [headers, ...data] = jsonData;
        const contactosData = data.map((row) => {
            return {
                id_data: row[headers.indexOf("id_data")],
                region: row[headers.indexOf("Region")],
                sede: row[headers.indexOf("Sede")],
                titulacion: row[headers.indexOf("Titulación")],
                nivel: row[headers.indexOf("Nivel")],
                escuela: row[headers.indexOf("Escuela")],
                carrera: row[headers.indexOf("Carrera")],
                jornada: row[headers.indexOf("Jornada")],
                rut: row[headers.indexOf("RUT")],
                segmento: row[headers.indexOf("SEGMENTO")],
                nombre: row[headers.indexOf("Nombre")],
                sexo: row[headers.indexOf("Sexo")],
                telefono1: row[headers.indexOf("Telefono")],
                telefono2: row[headers.indexOf("Telefono2")],
                telefono3: row[headers.indexOf("Telefono3")],
                telefono4: row[headers.indexOf("Telefono4")],
                telefono5: row[headers.indexOf("Telefono5")],
                telefono6: row[headers.indexOf("Telefono6")],
                telefono7: row[headers.indexOf("Telefono7")],
                proyectoId: idProyecto
            };
        });
        return contactosData;
    } catch (error) {
        // Si hay un error al analizar el archivo XLSX, devuelve null
        return null;
    }
}
const actualizarContacto = async (req, res) => {
    try {
        const { idContacto, idProyecto } = req.params;
        const { id_data, region, sede, titulacion, nivel, escuela, carrera, jornada, rut, segmento, nombre, sexo, telefono1, telefono2, telefono3, telefono4, telefono5, telefono6, telefono7, estado } = req.body;

        const actualizarTelefono = async (telefono) => {
            const telefonoEntity = await Telefono.findOne({ where: { id: telefono.id } });

            if (telefonoEntity) {
                telefonoEntity.set({ telefono: telefono.telefono });
                await telefonoEntity.save();
            }
        };

        const telefonos = [telefono1, telefono2, telefono3, telefono4, telefono5, telefono6, telefono7];
        await Promise.all(telefonos.map(actualizarTelefono));

        const contacto = await Contacto.findOne({ where: { id:idContacto } });
        if (!contacto) {
            return res.status(400).json({ error: 'El contacto no existe' });
        }

        contacto.set({
            id_data, region, sede, titulacion, nivel,
            escuela, carrera, jornada, rut, segmento, nombre, sexo, estado
        });
        await contacto.save();

        const contactos = await Contacto.findAll({
            where: {
                proyectoId: idProyecto,
            },
            include: [
                {
                    model: Telefono,
                    required:true
                }
            ]
        });

        res.status(200).json({ msg: 'Contacto actualizado correctamente', contactos });

    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar al contacto' });
    }
}
const crearContacto = async (req, res) => {
    try {
        await check('id_data').notEmpty().withMessage('El id data no puede ir vacío').run(req);
        const resultado = validationResult(req);
        
        if (!resultado.isEmpty()) {
            return res.status(400).json({ errors: resultado.array() });
        }

        const { idProyecto } = req.params;
        const { id_data, region, sede, titulacion, nivel, escuela, carrera, jornada, rut, segmento, nombre, sexo, telefono1, telefono2, telefono3,
            telefono4, telefono5, telefono6, telefono7 } = req.body;

        const existeContacto = await Contacto.findOne({ where: { id_data, proyectoId: idProyecto } });
        if (existeContacto) {
            return res.status(400).json({ error: 'Ya existe un contacto con ese id_data' });
        }
        const contacto = await db.transaction(async (t) => {
            const nuevoContacto = await Contacto.create(
                { id_data, region, sede, titulacion, nivel, escuela, carrera, jornada, rut, segmento, nombre, sexo, estado: true, proyectoId: idProyecto },
                { transaction: t }
            );

            const telefonos = [telefono1, telefono2, telefono3, telefono4, telefono5, telefono6, telefono7];
            for (let i = 0; i < telefonos.length; i++) {
                await Telefono.create(
                    { telefono: telefonos[i].telefono, contactoId: nuevoContacto.id, orden: i + 1, estado:true },
                    { transaction: t }
                );
            }

            return nuevoContacto;
        });

        const contactos = await Contacto.findAll({
            where: {
                proyectoId: idProyecto,
            },
            include: [
                {
                    model: Telefono,
                },
            ],
        });

        res.status(200).json({ contacto, contactos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear al contacto' });
    }
}

export {
    listarContactosPorProyecto,
    cargarContactosProyecto,
    actualizarContacto,
    crearContacto,
}