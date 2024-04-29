import { check, validationResult } from 'express-validator'
import { Sequelize, Proyecto, ProyectoUsuario, Usuario, Rol } from '../models/index.js'

const crearProyecto = async (req, res) => {
    try {
        await check('nombre').isLength({ min: 6 }).withMessage('El nombre del proyecto debe ser de al menos 6 caracteres').run(req)
        await check('numero_llamada_dia').notEmpty().withMessage('El campo número de llamada del día es obligatorio').run(req);
        await check('hora_inicio_llamada').notEmpty().withMessage('El campo hora de inicio de llamada es obligatorio').run(req);
        await check('hora_termino_llamada').notEmpty().withMessage('El campo hora de término de llamada es obligatorio').run(req);
        await check('fecha_inicio_llamada').notEmpty().withMessage('El campo fecha de inicio de llamada es obligatorio').run(req);
        await check('fecha_termino_llamada').notEmpty().withMessage('El campo fecha de término de llamada es obligatorio').run(req);
        
        let resultado = validationResult(req)
        if (!resultado.isEmpty()) {
            return res.status(400).json({ errors: resultado.array() })
        }
        const { nombre, numero_llamada_dia, hora_inicio_llamada, hora_termino_llamada,fecha_inicio_llamada,fecha_termino_llamada } = req.body;
        const existeProyecto = await Proyecto.findOne({ where: { nombre } })
        if (existeProyecto) {
            return res.status(400).json({ error: 'El proyecto ya existe' });
        }
        // Crear el proyecto
        const proyecto = await Proyecto.create({ nombre,numero_llamada_dia,hora_inicio_llamada,hora_termino_llamada,fecha_inicio_llamada,fecha_termino_llamada, estado: true });
        // Obtener la lista actualizada de proyectos
        const proyectosActualizados = await Proyecto.findAll({
            include: [
                {
                    model: ProyectoUsuario,
                    required:false,
                    include: [
                        {
                            model: Usuario,
                            required: true,
                            include: [
                                {
                                    model: Rol,
                                    required: true
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        res.status(200).json({ proyecto, proyectos: proyectosActualizados });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el proyecto' })
    }

}
const actualizarProyecto = async (req, res) => {
    try {
        const { nombre, estado } = req.body;
        await check('nombre').isLength({ min: 6 }).withMessage('El nombre del proyecto debe ser de al menos 6 caracteres').run(req);
        let resultado = validationResult(req);
        if (!resultado.isEmpty()) {
            return res.status(400).json({ errors: resultado.array() });
        }
        const { idProyecto } = req.params;
        const proyecto = await Proyecto.findOne({ where: { id: idProyecto } });
        if (!proyecto) {
            return res.status(400).json({ error: 'El proyecto no existe' });
        }

        // Verificar si el nombre ha cambiado
        if (nombre !== proyecto.nombre) {
            const existeProyecto = await Proyecto.findOne({ where: { nombre } });
            if (existeProyecto) {
                return res.status(400).json({ error: 'El proyecto ya existe' });
            }
        }

        proyecto.set({
            nombre,
            estado,
        });

        await proyecto.save();

        // Consultar la lista actualizada de proyectos
        const proyectosActualizados = await Proyecto.findAll({
            include: [
                {
                    model: ProyectoUsuario,
                    required:false,
                    include: [
                        {
                            model: Usuario,
                            required:true,
                            include: [
                                {
                                    model: Rol,
                                    required:true
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        res.status(200).json({ msg: 'Proyecto actualizado correctamente', proyectos: proyectosActualizados });

    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar al proyecto' });
    }
};

const listarProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.findAll({
            include: [
                {
                    model: ProyectoUsuario,
                    required:false,
                    include: [
                        {
                            model: Usuario,
                            required:true,
                            include: [
                                {
                                    model: Rol,
                                    required:true
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        res.status(200).json({ proyectos });
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los proyectos' });
    }
}
const listarProyectosEstadoActivo = async (req, res) => {
    try {
        const proyectos = await Proyecto.findAll({
            where: {
                estado: true,
            },
            include: [
                {
                    model: ProyectoUsuario,
                    required:false,
                    include: [
                        {
                            model: Usuario,
                            required:true,
                            include: [
                                {
                                    model: Rol,
                                    required:true,
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        res.status(200).json({ proyectos });
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los proyectos' });
    }
}

const obtenerProyectosMesAnio = async (req, res) => {
    try {
        const { anio } = req.params; // Obtener el año desde los parámetros

        const mesNumeros = {
            Jan: 1,
            Feb: 2,
            Mar: 3,
            Apr: 4,
            May: 5,
            Jun: 6,
            Jul: 7,
            Aug: 8,
            Sep: 9,
            Oct: 10,
            Nov: 11,
            Dec: 12,
        };

        // Utiliza la función Sequelize.fn para agrupar por mes y filtra por año
        const proyectosPorMesAnio = await Proyecto.findAll({
            attributes: [
                [Sequelize.fn('date_format', Sequelize.col('createdAt'), '%b'), 'mes'],
                [Sequelize.fn('count', '*'), 'cantidad'],
            ],
            where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('createdAt')), anio),
            group: ['mes'],
            order: [
                [Sequelize.fn('FIELD', Sequelize.col('mes'), ...Object.keys(mesNumeros))],
                ['mes', 'DESC']
            ],
        });

        res.status(200).json({ proyectosPorMesAnio });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al obtener proyectos por mes y año' });
    }
}

const listarProyectosUsuario = async (req, res) => {
    try {
        // Obtener el ID del usuario desde la información de la solicitud
        const { idUsuario } = req.params;

        // Buscar los proyectos asignados al usuario
        const proyectosAsignados = await Proyecto.findAll({
            include: [
                {
                    model: ProyectoUsuario,
                    required:true,
                    where: {
                        usuarioId: idUsuario,
                    },
                    include: [
                        {
                            model: Usuario,
                            required:true,
                            include: [
                                {
                                    model: Rol,
                                },
                            ],
                        },
                    ],
                },
            ],
            where: {
                estado: true
            }
        });

        res.status(200).json({ proyectosAsignados });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los proyectos asignados al usuario' });
    }
};




export {
    crearProyecto,
    actualizarProyecto,
    listarProyectos,
    listarProyectosEstadoActivo,
    obtenerProyectosMesAnio,
    listarProyectosUsuario,

} 