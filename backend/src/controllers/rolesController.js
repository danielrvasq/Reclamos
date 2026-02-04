import RolesModel from "../models/rolesModel.js";

class RolesController {
  // GET: Obtener todos los roles
  static async getAllRoles(req, res) {
    try {
      const roles = await RolesModel.getAllRoles();
      res.json({
        status: "success",
        message: "Roles obtenidos correctamente",
        data: roles,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // GET: Obtener un rol por ID
  static async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await RolesModel.getRoleById(id);

      if (!role) {
        return res.status(404).json({
          status: "error",
          message: "Rol no encontrado",
        });
      }

      res.json({
        status: "success",
        message: "Rol obtenido correctamente",
        data: role,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // POST: Crear un nuevo rol
  static async createRole(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json({
          status: "error",
          message: "El nombre del rol es requerido",
        });
      }

      const newRole = await RolesModel.createRole({
        nombre,
        descripcion,
      });

      res.status(201).json({
        status: "success",
        message: "Rol creado correctamente",
        data: newRole,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // PUT: Actualizar un rol
  static async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json({
          status: "error",
          message: "El nombre del rol es requerido",
        });
      }

      const updatedRole = await RolesModel.updateRole(id, {
        nombre,
        descripcion,
      });

      res.json({
        status: "success",
        message: "Rol actualizado correctamente",
        data: updatedRole,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  }

  // DELETE: Eliminar un rol
  static async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const result = await RolesModel.deleteRole(id);

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

export default RolesController;
