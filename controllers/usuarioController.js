import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { Usuario, Rol, ProyectoUsuario } from '../models/index.js'
import { generarJWT } from '../helpers/tokens.js'


const registrar = async (req, res) => {
    try {
        //Validación
        await check('nombre').notEmpty().withMessage('El nombre de usuario no puede ir vacio').run(req)
        await check('password').isLength({ min: 6 }).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)
        await check('repetir_password').equals(req.body.password).withMessage('Las contraseñas no son iguales').run(req)
        let resultado = validationResult(req)
        if (!resultado.isEmpty()) {
            return res.status(400).json({ errors: resultado.array() })
        }
        //Verficar usuario duplicado
        const { nombre, password, rolId } = req.body
        const existeUsuario = await Usuario.findOne({ where: { nombre } })
        if (existeUsuario) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
        if (!rolId) {
            return res.status(400).json({ error: 'Debes seleccionar un rol válido' });
        }
        const rol = await Rol.findByPk(rolId);
        if (!rol) {
            return res.status(400).json({ error: 'El rol especificado no es válido' });
        }
        const usuario = await Usuario.create({ nombre, password, estado: true, rolId });

        const usuarios = await Usuario.findAll({
            required:true,
            include: Rol,
        });
        res.status(200).json({ usuario, usuarios })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al crear el usuario' })
    }
}

const autenticar = async (req, res) => {
    try {
        await check('nombre').notEmpty().withMessage('El nombre de usuario no puede ir vacio').run(req)
        await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req)
        let resultado = validationResult(req)
        if (!resultado.isEmpty()) {
            return res.status(400).json({ errors: resultado.array() })
        }
        //Comprobar si el usuario existe
        const usuario = await Usuario.findOne({
            required:true,
            where: { nombre: req.body.nombre },
            include: Rol
        });
        if (!usuario) {
            return res.status(400).json({ error: 'El usuario no existe' });
        }
        if (!usuario.estado) {
            return res.status(400).json({ error: 'El usuario esta inhabilitado' });
        }
        //Revisar el password
        if (!usuario.verificarPassword(req.body.password)) {
            return res.status(400).json({ error: 'La contraseña es incorrecta' });
        }
        //Autenticar al usuario
        const token = generarJWT({ id: usuario.id, nombre: usuario.nombre })
        return res.cookie('_token', token, {
            httpOnly: true,
        }).status(200).json({ detalles: { id: usuario.id, nombre: usuario.nombre, rol: { id: usuario.role.id, nombre: usuario.role.nombre }, token: token } })
    } catch (error) {
        console.error('Error en el proceso de autenticación:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }

}

const cerrarSesion = (req, res) => {
    res.clearCookie('_token');
    res.status(200).json({ mensaje: 'Sesión cerrada exitosamente' });
};
const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            required:true,
            include: Rol,
        });
        res.status(200).json({ usuarios });
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los usuarios' });
    }
};
const actualizarUsuario = async (req, res) => {
    try {
        const { nombre, password, estado, rolId } = req.body;
        await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
        if (password) {
            await check('password').isLength({ min: 6 }).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)
            await check('repetir_password').equals(req.body.password).withMessage('Las contraseñas no son iguales').run(req)
        }
        let resultado = validationResult(req)
        if (!resultado.isEmpty()) {
            return res.status(400).json({ errors: resultado.array() })
        }
        const { idUsuario } = req.params;
        const usuario = await Usuario.findOne({ where: { id:idUsuario } })
        if (!usuario) {
            return res.status(400).json({ error: 'El usuario no existe' });
        }
        if(!rolId){
            return res.status(400).json({ error: 'Debes seleccionar un rol válido' });
        }
        const rol = await Rol.findByPk(rolId);
        if (!rol) {
            return res.status(400).json({ error: 'El rol especificado no existe' });
        }

        const salt = await bcrypt.genSalt(10)
        if (!password) {
            usuario.set({
                nombre,
                estado,
                rolId
            })
        } else {
            usuario.set({
                nombre,
                estado,
                rolId,
                password: await bcrypt.hash(password, salt)
            })
        }
        await usuario.save();
        const usuarios = await Usuario.findAll({
            required:true,
            include: Rol,
        });

        res.status(200).json({ msg: 'Usuario actualizado correctamente', usuarios });

    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar al usuario' });
    }
}
const listarRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll();
        res.status(200).json({ roles });
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los roles' });
    }
}

const listarUsuariosAsignadosProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params
        const usuariosAsignados = await Usuario.findAll({
            include: [
                {
                    required:true,
                    model: Rol,
                },
                {
                    model: ProyectoUsuario,
                    required:true,
                    where: {
                        proyectoId: idProyecto
                    },
                },
            ],
        });
        res.status(200).json({ usuariosAsignados });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar los usuarios asignados del proyecto' });
    }
}
const listarUsuariosNoAsignadosProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params;

        const usuariosNoAsignados = await Usuario.findAll({
            include: [
                {
                    model: Rol,
                    required:true
                },
                {
                    model: ProyectoUsuario,
                    required: false,
                    where: {
                        proyectoId: idProyecto
                    },
                }
            ],
           
            where: {
                '$proyectosusuarios.proyectoId$': null  
            }
        });

        res.status(200).json({ usuariosNoAsignados });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar los usuarios no asignados del proyecto' });
    }
}
const obtenerPorcentajeUsuariosAyNAProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params;
        const usuariosAsignados = await Usuario.findAll({
            include: [
                {
                    model: Rol,
                    required:true
                },
                {
                    model: ProyectoUsuario,
                    required:true,
                    where: {
                        proyectoId: idProyecto
                    },
                },
            ],
        });
        const usuariosNoAsignados = await Usuario.findAll({
            include: [
                {
                    model: Rol,
                    required:true
                },
                {
                    model: ProyectoUsuario,
                    required: false,
                    where: {
                        proyectoId: idProyecto
                    }
                }
            ],
            where: {
                '$proyectosusuarios.proyectoId$': null
            }
        });
        const totalUsuarios = usuariosAsignados.length + usuariosNoAsignados.length;
        const porcentajeAsignados = (usuariosAsignados.length / totalUsuarios) * 100;
        const porcentajeNoAsignados = (usuariosNoAsignados.length / totalUsuarios) * 100;

        res.status(200).json({
            porcentajeAsignados,
            porcentajeNoAsignados,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la información del proyecto' });
    }
}
const cargarUsuariosProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params;
        const usuariosSeleccionados = req.body;

        if (usuariosSeleccionados.length === 0) {
            return res.status(400).json({ error: 'Debes seleccionar a algún usuario' });
        }

        // Utiliza map para obtener un array de promesas
        await Promise.all(usuariosSeleccionados.map(async usuario => {
            await ProyectoUsuario.create({ proyectoId: idProyecto, usuarioId: usuario.id });
        }));

        // Consulta SQL para obtener los usuarios que no están asignados al proyecto
        const usuariosNoAsignados = await Usuario.findAll({
            include: [
                { 
                    required:true,
                    model: Rol 
                },
                {
                    model: ProyectoUsuario,
                    where: { proyectoId: idProyecto },
                    required: false // Esto convierte el JOIN en LEFT JOIN
                }
            ],
            // Usamos where para seleccionar solo los usuarios que no tienen una correspondencia en ProyectoUsuario
            where: { '$proyectosusuarios.proyectoId$': null }
        });

        res.status(200).json({ usuariosNoAsignados });
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar usuarios al proyecto' });
    }
};
const eliminarUsuariosProyecto = async (req, res) => {
    try {
        const { idProyecto } = req.params
        const usuariosSeleccionados = req.body
        if (usuariosSeleccionados.length === 0) {
            return res.status(400).json({ error: 'Debes seleccionar a algún usuario' });
        }

        await Promise.all(usuariosSeleccionados.map(async (usuario) => {
            await ProyectoUsuario.destroy({
                where: {
                    proyectoId: idProyecto,
                    usuarioId: usuario.id,
                },
            });
        }));
        // Después de eliminar los usuarios, obtener la lista actualizada
        const usuariosAsignados = await Usuario.findAll({
            include: [
                {
                    required:true,
                    model: Rol,
                },
                {
                    model: ProyectoUsuario,
                    required:true,
                    where: {
                        proyectoId: idProyecto,
                    },
                },
            ],
        });

        res.status(200).json({ msg: 'Usuarios desasignados exitosamente', usuariosAsignados });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuarios del proyecto' });
    }
};


export {
    registrar,
    autenticar,
    cerrarSesion,
    listarUsuarios,
    actualizarUsuario,
    listarRoles,
    listarUsuariosAsignadosProyecto,
    listarUsuariosNoAsignadosProyecto,
    obtenerPorcentajeUsuariosAyNAProyecto,
    cargarUsuariosProyecto,
    eliminarUsuariosProyecto
} 