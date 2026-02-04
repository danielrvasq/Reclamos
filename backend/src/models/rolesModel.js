import { sql, poolPromise } from "../config/server.js";

class RolesModel {
  // Obtener todos los roles
  static async getAllRoles() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM roles ORDER BY id DESC");
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener roles: ${err.message}`);
    }
  }

  // Obtener un rol por ID
  static async getRoleById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM roles WHERE id = @id");
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener rol: ${err.message}`);
    }
  }

  // Crear un nuevo rol
  static async createRole(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("nombre", sql.VarChar(100), data.nombre)
        .input("descripcion", sql.VarChar(500), data.descripcion || null)
        .query(
          `INSERT INTO roles (nombre, descripcion) 
           VALUES (@nombre, @descripcion);
           SELECT SCOPE_IDENTITY() as id;`
        );
      return result.recordset[0];
    } catch (err) {
      throw new Error(`Error al crear rol: ${err.message}`);
    }
  }

  // Actualizar un rol
  static async updateRole(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("nombre", sql.VarChar(100), data.nombre)
        .input("descripcion", sql.VarChar(500), data.descripcion || null)
        .query(
          `UPDATE roles 
           SET nombre = @nombre, descripcion = @descripcion 
           WHERE id = @id`
        );
      return await this.getRoleById(id);
    } catch (err) {
      throw new Error(`Error al actualizar rol: ${err.message}`);
    }
  }

  // Eliminar un rol
  static async deleteRole(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM roles WHERE id = @id");
      return { message: "Rol eliminado correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar rol: ${err.message}`);
    }
  }
}

export default RolesModel;
