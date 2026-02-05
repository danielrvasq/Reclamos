import bcrypt from "bcryptjs";
import UsuariosModel from "../models/usuariosModel.js";

class UsuariosController {
  // GET: todos los usuarios
  static async getAllUsers(req, res) {
    try {
      const users = await UsuariosModel.getAllUsers();
      res.json({ status: "success", data: users });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // GET: usuario por ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UsuariosModel.getUserById(id);

      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "Usuario no encontrado" });
      }

      res.json({ status: "success", data: user });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // POST: crear usuario
  static async createUser(req, res) {
    try {
      const {
        nombre,
        correo,
        username,
        password,
        proveedor_auth,
        area_id,
        activo,
      } = req.body;

      if (!nombre || !username || !password) {
        return res.status(400).json({
          status: "error",
          message: "nombre, username y password son requeridos",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await UsuariosModel.createUser({
        nombre,
        correo,
        username,
        passwordHash,
        proveedor_auth,
        area_id,
        activo: typeof activo === "boolean" ? activo : true,
      });

      res.status(201).json({
        status: "success",
        message: "Usuario creado correctamente",
        data: newUser,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // PUT: actualizar usuario
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        correo,
        username,
        password,
        proveedor_auth,
        area_id,
        activo,
      } = req.body;

      if (!nombre || !username) {
        return res.status(400).json({
          status: "error",
          message: "nombre y username son requeridos",
        });
      }

      const userExists = await UsuariosModel.getUserById(id);
      if (!userExists) {
        return res
          .status(404)
          .json({ status: "error", message: "Usuario no encontrado" });
      }

      let passwordHash;
      let forcePasswordChange;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
        const roles = (req.usuario?.roles || []).map((r) => r.toLowerCase());
        const isAdmin = roles.includes("administrador");
        const isSelf = parseInt(req.usuario?.id, 10) === parseInt(id, 10);
        forcePasswordChange = isAdmin && !isSelf ? true : false;
      }

      const updatedUser = await UsuariosModel.updateUser(id, {
        nombre,
        correo,
        username,
        passwordHash,
        proveedor_auth,
        area_id,
        force_password_change: forcePasswordChange,
        activo: activo !== undefined ? activo : userExists.activo,
      });

      res.json({
        status: "success",
        message: "Usuario actualizado correctamente",
        data: updatedUser,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // DELETE: eliminar usuario
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const userExists = await UsuariosModel.getUserById(id);
      if (!userExists) {
        return res
          .status(404)
          .json({ status: "error", message: "Usuario no encontrado" });
      }

      const result = await UsuariosModel.deleteUser(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // PUT: cambiar contraseña del usuario (self o admin)
  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          status: "error",
          message: "password es requerido",
        });
      }

      const userExists = await UsuariosModel.getUserById(id);
      if (!userExists) {
        return res
          .status(404)
          .json({ status: "error", message: "Usuario no encontrado" });
      }

      const roles = (req.usuario?.roles || []).map((r) => r.toLowerCase());
      const isAdmin = roles.includes("administrador");
      const isSelf = parseInt(req.usuario?.id, 10) === parseInt(id, 10);

      if (!isAdmin && !isSelf) {
        return res.status(403).json({
          status: "error",
          message: "No tienes permisos para cambiar esta contraseña",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const updatedUser = await UsuariosModel.updatePassword(
        id,
        passwordHash,
        false
      );

      res.json({
        status: "success",
        message: "Contraseña actualizada correctamente",
        data: updatedUser,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default UsuariosController;
