import { TipoIncidencia, Incidencia, Telefono, Contacto} from '../models/index.js'

const listarTiposIncidencias= async (req, res) => {
    try {
        const tiposIncidencias = await TipoIncidencia.findAll();
        res.status(200).json({ tiposIncidencias });
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los tipos de incidencias' });
    }
}
const crearIncidencia = async (req,res)=>{
    try{
        const {tipoIncidenciaId, descripcion} = req.body
        const {idTelefono} = req.params

        if (!tipoIncidenciaId) {
            return res.status(400).json({ error: 'Debes seleccionar un tipo de incidencia válido' });
        }

        const tipoIncidencia = await TipoIncidencia.findByPk(tipoIncidenciaId)

        if(!tipoIncidencia){
            return res.status(400).json({ error: 'El tipo de incidencia no es válido' });
        }
        const incidencia = await Incidencia.create({descripcion:descripcion, estado:true, telefonoId: idTelefono, tipoIncidenciaId:tipoIncidenciaId });
        res.status(200).json({incidencia});
        
    }catch(error){
        res.status(500).json({ error: 'Error al guardar la incidencia' });
    }
}
const listarIndicenciasTelefono = async (req, res) => {
    try {
        const {idTelefono} = req.params;
        const incidencias = await Incidencia.findAll({
            where:{
                telefonoId: idTelefono
            },
            include: [
                {
                    required:true,
                    model:TipoIncidencia
                },
            ],
        });
        res.status(200).json({ incidencias });
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las incidencias' });
    }
}
const actualizarIncidencia = async (req,res)=>{
    try{
        const {tipoIncidenciaId, descripcion} = req.body
        const {id} = req.params
        if (!tipoIncidenciaId) {
            return res.status(400).json({ error: 'Debes seleccionar un tipo de incidencia válido' });
        }

        const tipoIncidencia = await TipoIncidencia.findByPk(tipoIncidenciaId)

        if(!tipoIncidencia){
            return res.status(400).json({ error: 'El tipo de incidencia no es válido' });
        }
        const incidencia = await Incidencia.findOne({where:{id}})
        if (!incidencia) {
            return res.status(400).json({ error: 'La incidencia no existe' });
        }
        incidencia.set({
            descripcion,
            tipoIncidenciaId
        })
        await incidencia.save();
        res.status(200).json({ msg: 'Incidencia actualizada correctamente'})

    }catch(error){
        res.status(500).json({ error: 'Error al actualizar la incidencia' });
    }
}

export {
    listarTiposIncidencias,
    crearIncidencia,
    listarIndicenciasTelefono,
    actualizarIncidencia
}