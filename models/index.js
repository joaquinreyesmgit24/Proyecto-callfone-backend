import Rol from './Rol.js'
import Usuario from './Usuario.js'
import Proyecto from './Proyecto.js'
import ProyectoUsuario from './ProyectoUsuario.js'
import Contacto from './Contacto.js'
import Telefono from './Telefono.js'
import Incidencia from './Incidencia.js'
import TipoIncidencia from './TipoIncidencia.js'
import  Sequelize  from 'sequelize'

Rol.hasMany(Usuario, {foreignKey:'rolId'})
Usuario.belongsTo(Rol, {foreignKey: 'rolId'})
Proyecto.hasMany(ProyectoUsuario, {foreignKey:'proyectoId'})
ProyectoUsuario.belongsTo(Proyecto, {foreignKey:'proyectoId'})
Usuario.hasMany(ProyectoUsuario,{foreignKey:'usuarioId'})
ProyectoUsuario.belongsTo(Usuario, {foreignKey:'usuarioId'})
Proyecto.hasMany(Contacto,{foreignKey:'proyectoId'})
Contacto.belongsTo(Proyecto, {foreignKey: 'proyectoId'})
Contacto.hasMany(Telefono,{foreignKey: 'contactoId'})
Telefono.belongsTo(Contacto,{foreignKey: 'contactoId'})
Telefono.hasMany(Incidencia, { foreignKey: 'telefonoId' });
Incidencia.belongsTo(Telefono, { foreignKey: 'telefonoId' })
TipoIncidencia.hasMany(Incidencia, {foreignKey: 'tipoIncidenciaId'})
Incidencia.belongsTo(TipoIncidencia, {foreignKey: 'tipoIncidenciaId'})


export {
    Usuario,
    Rol,
    Proyecto,
    ProyectoUsuario,
    Contacto,
    Telefono,
    Sequelize,
    Incidencia,
    TipoIncidencia,
}