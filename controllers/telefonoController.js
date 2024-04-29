import { Sequelize, Telefono, Contacto, Proyecto, ProyectoUsuario,Incidencia,TipoIncidencia } from '../models/index.js'

const listarTelefonosProyectoUsuario = async (req, res) => {
    try {
 
        const { idProyecto, idUsuario } = req.params;

        const telefonos = await Telefono.findAll({
            attributes: [
                'id',
                'telefono',
                'orden',
                'estado',
                [Sequelize.literal('(SELECT COUNT(*) FROM incidencias WHERE incidencias.telefonoId = telefonos.id)'), 'cantidadLlamadas'],
                [Sequelize.literal('(SELECT MAX(incidencias.createdAt) FROM incidencias WHERE incidencias.telefonoId = telefonos.id)'), 'ultimaLlamada'],
            ],
            where: {
                telefono: {
                    [Sequelize.Op.and]: [
                        Sequelize.literal('LENGTH(telefono) > 0'),
                        Sequelize.literal('TRIM(telefono) != ""'),
                    ],
                },
                estado: true,
            },
            include: [
                {
                    model: Contacto,
                    required: true,
                    where: {
                        estado: true,
                        proyectoId: idProyecto,
                    },
                    include: [
                        {
                            model: Proyecto,
                            required: true,
                            where: {
                                estado: true,
                                fecha_inicio_llamada: {
                                    [Sequelize.Op.lte]: new Date(), // Fecha actual debe ser mayor o igual a fecha_inicio_llamada
                                },
                                fecha_termino_llamada: {
                                    [Sequelize.Op.gte]: new Date(), // Fecha actual debe ser menor o igual a fecha_termino_llamada
                                },
                                hora_inicio_llamada: {
                                    [Sequelize.Op.lte]: Sequelize.fn('CURTIME'), // Hora actual debe ser mayor o igual a hora_inicio_llamada
                                },
                                hora_termino_llamada: {
                                    [Sequelize.Op.gte]: Sequelize.fn('CURTIME'), // Hora actual debe ser menor o igual a hora_termino_llamada
                                },
                            },
                            include: [
                                {
                                    model: ProyectoUsuario,
                                    required: true,
                                    where: {
                                        usuarioId: idUsuario,
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Incidencia,
                    required: false,
                    include: [
                        {
                            model: TipoIncidencia,
                            required: true,
                        },
                    ],
                },
            ],
            group: [
                'telefonos.id',
                'contacto->proyecto->proyectosusuarios.id',
                'incidencias.id',
            ],
        });

        // Filtrar los teléfonos que han excedido el límite de llamadas permitidas por día
        const telefonosFiltrados = telefonos.filter((telefono) => {
            const cantidadLlamadas = telefono.getDataValue('cantidadLlamadas') || 0;
            const limiteLlamadasPorDia =telefono.getDataValue('contacto').proyecto.numero_llamada_dia
            return cantidadLlamadas < limiteLlamadasPorDia;
        });
        res.status(200).json({ telefonos:telefonosFiltrados });
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los telefonos' });
    }
};
const finalizarTelefono = async (req,res)=>{
    try{
        const {idTelefono} = req.params;
        const telefono = await Telefono.findOne({ where: { id:idTelefono } })
        if(!telefono){
            return res.status(400).json({ error: 'El teléfono no existe' });
        }
        telefono.set({estado:false})
        await telefono.save();
        res.status(200).json({ msg: 'La encuesta se ha finalizado con exito'});

    }catch(error){
        res.status(500).json({ error: 'No se ha podido finalizar la encuesta' });
    }
}
const listarTelefonosContacto = async (req,res)=>{
    try{
        const {idContacto} = req.params;

        const telefonos = await Telefono.findAll({
            include: [
                    {
                        model: Contacto,
                        required: true,
                        where: {
                            id:idContacto
                        }
                    }
                ]
        })
        res.status(200).json({ telefonos });

    }catch(error){
        res.status(500).json({ error: 'Error al listar los telefonos' });
    }
}


export {
    listarTelefonosProyectoUsuario,
    finalizarTelefono,
    listarTelefonosContacto

}