import { sql, poolPromise } from "../config/server.js";

class UsuarioRolesModel {
  // Obtener todos los usuario_roles con información relacionada
  static async getAllUserRoles() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT 
          ur.id,
          ur.usuario_id,
          ur.rol_id,
          u.nombre as usuario_nombre,
          u.username,
          r.nombre as rol_nombre
         FROM usuario_roles ur
         LEFT JOIN usuarios u ON ur.usuario_id = u.id
         LEFT JOIN roles r ON ur.rol_id = r.id
         ORDER BY ur.id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener usuario_roles: ${err.message}`);
    }
  }

  // Obtener usuario_roles por ID
  static async getUserRoleById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT 
            ur.id,
            ur.usuario_id,
            ur.rol_id,
            u.nombre as usuario_nombre,
            u.username,
            r.nombre as rol_nombre
           FROM usuario_roles ur
           LEFT JOIN usuarios u ON ur.usuario_id = u.id
           LEFT JOIN roles r ON ur.rol_id = r.id
           WHERE ur.id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener usuario_rol: ${err.message}`);
    }
  }

  // Obtener roles de un usuario específico
  static async getRolesByUserId(usuarioId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("usuarioId", sql.Int, usuarioId)
        .query(
          `SELECT 
            ur.id,
            ur.rol_id,
            r.nombre as rol_nombre,
            r.descripcion as rol_descripcion
           FROM usuario_roles ur
           INNER JOIN roles r ON ur.rol_id = r.id
           WHERE ur.usuario_id = @usuarioId`
        );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener roles del usuario: ${err.message}`);
    }
  }

  // Obtener usuarios con un rol específico
  static async getUsersByRoleId(rolId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("rolId", sql.Int, rolId)
        .query(
          `SELECT 
            ur.id,
            ur.usuario_id,
            u.nombre as usuario_nombre,
            u.username,
            u.correo
           FROM usuario_roles ur
           INNER JOIN usuarios u ON ur.usuario_id = u.id
           WHERE ur.rol_id = @rolId`
        );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener usuarios con el rol: ${err.message}`);
    }
  }

  // Crear nueva asignación usuario-rol
  static async createUserRole(data) {
    try {
      const pool = await poolPromise;

      // Verificar si ya existe la asignación
      const existing = await pool
        .request()
        .input("usuarioId", sql.Int, data.usuario_id)
        .input("rolId", sql.Int, data.rol_id)
        .query(
          `SELECT id FROM usuario_roles 
           WHERE usuario_id = @usuarioId AND rol_id = @rolId`
        );

      if (existing.recordset.length > 0) {
        throw new Error("El usuario ya tiene asignado este rol");
      }

      const result = await pool
        .request()
        .input("usuarioId", sql.Int, data.usuario_id)
        .input("rolId", sql.Int, data.rol_id)
        .query(
          `INSERT INTO usuario_roles (usuario_id, rol_id)
           VALUES (@usuarioId, @rolId);
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getUserRoleById(newId);
    } catch (err) {
      throw new Error(`Error al crear usuario_rol: ${err.message}`);
    }
  }

  // Actualizar asignación usuario-rol
  static async updateUserRole(id, data) {
    try {
      const pool = await poolPromise;

      // Verificar si la nueva combinación ya existe (excluyendo el registro actual)
      const existing = await pool
        .request()
        .input("id", sql.Int, id)
        .input("usuarioId", sql.Int, data.usuario_id)
        .input("rolId", sql.Int, data.rol_id)
        .query(
          `SELECT id FROM usuario_roles 
           WHERE usuario_id = @usuarioId AND rol_id = @rolId AND id != @id`
        );

      if (existing.recordset.length > 0) {
        throw new Error("El usuario ya tiene asignado este rol");
      }

      await pool
        .request()
        .input("id", sql.Int, id)
        .input("usuarioId", sql.Int, data.usuario_id)
        .input("rolId", sql.Int, data.rol_id)
        .query(
          `UPDATE usuario_roles 
           SET usuario_id = @usuarioId, rol_id = @rolId 
           WHERE id = @id`
        );

      return await this.getUserRoleById(id);
    } catch (err) {
      throw new Error(`Error al actualizar usuario_rol: ${err.message}`);
    }
  }

  // Eliminar asignación usuario-rol
  static async deleteUserRole(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM usuario_roles WHERE id = @id");
      return { message: "Asignación usuario-rol eliminada correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar usuario_rol: ${err.message}`);
    }
  }

  // Eliminar todos los roles de un usuario
  static async deleteAllRolesByUserId(usuarioId) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("usuarioId", sql.Int, usuarioId)
        .query("DELETE FROM usuario_roles WHERE usuario_id = @usuarioId");
      return { message: "Todos los roles del usuario fueron eliminados" };
    } catch (err) {
      throw new Error(`Error al eliminar roles del usuario: ${err.message}`);
    }
  }
}

export default UsuarioRolesModel;
