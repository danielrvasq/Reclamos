import UsuarioRolesModel from "../models/usuarioRolesModel.js";

class UsuarioRolesController {
  // GET: obtener todas las asignaciones usuario-rol
  static async getAllUserRoles(req, res) {
    try {
      const userRoles = await UsuarioRolesModel.getAllUserRoles();
      res.json({
        status: "success",
        message: "Asignaciones usuario-rol obtenidas correctamente",
        data: userRoles,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // GET: obtener asignación por ID
  static async getUserRoleById(req, res) {
    try {
      const { id } = req.params;
      const userRole = await UsuarioRolesModel.getUserRoleById(id);

      if (!userRole) {
        return res.status(404).json({
          status: "error",
          message: "Asignación usuario-rol no encontrada",
        });
      }

      res.json({
        status: "success",
        message: "Asignación usuario-rol obtenida correctamente",
        data: userRole,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // GET: obtener roles de un usuario
  static async getRolesByUserId(req, res) {
    try {
      const { usuarioId } = req.params;
      const roles = await UsuarioRolesModel.getRolesByUserId(usuarioId);

      res.json({
        status: "success",
        message: "Roles del usuario obtenidos correctamente",
        data: roles,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // GET: obtener usuarios con un rol específico
  static async getUsersByRoleId(req, res) {
    try {
      const { rolId } = req.params;
      const users = await UsuarioRolesModel.getUsersByRoleId(rolId);

      res.json({
        status: "success",
        message: "Usuarios con el rol obtenidos correctamente",
        data: users,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // POST: crear nueva asignación usuario-rol
  static async createUserRole(req, res) {
    try {
      const { usuario_id, rol_id } = req.body;

      if (!usuario_id || !rol_id) {
        return res.status(400).json({
          status: "error",
          message: "usuario_id y rol_id son requeridos",
        });
      }

      const newUserRole = await UsuarioRolesModel.createUserRole({
        usuario_id,
        rol_id,
      });

      res.status(201).json({
        status: "success",
        message: "Asignación usuario-rol creada correctamente",
        data: newUserRole,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // PUT: actualizar asignación usuario-rol
  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { usuario_id, rol_id } = req.body;

      if (!usuario_id || !rol_id) {
        return res.status(400).json({
          status: "error",
          message: "usuario_id y rol_id son requeridos",
        });
      }

      const updatedUserRole = await UsuarioRolesModel.updateUserRole(id, {
        usuario_id,
        rol_id,
      });

      res.json({
        status: "success",
        message: "Asignación usuario-rol actualizada correctamente",
        data: updatedUserRole,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // DELETE: eliminar asignación usuario-rol
  static async deleteUserRole(req, res) {
    try {
      const { id } = req.params;
      const result = await UsuarioRolesModel.deleteUserRole(id);

      res.json({
        status: "success",
        message: result.message,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // DELETE: eliminar todos los roles de un usuario
  static async deleteAllRolesByUserId(req, res) {
    try {
      const { usuarioId } = req.params;
      const result = await UsuarioRolesModel.deleteAllRolesByUserId(usuarioId);

      res.json({
        status: "success",
        message: result.message,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }
}

export default UsuarioRolesController;
