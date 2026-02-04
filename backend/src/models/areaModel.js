import { sql, poolPromise } from "../config/server.js";

class AreaModel {
  // Obtener todas las áreas
  static async getAllAreas() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, nombre, responsable
         FROM area
         ORDER BY nombre ASC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener áreas: ${err.message}`);
    }
  }

  // Obtener área por ID
  static async getAreaById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, nombre, responsable
           FROM area
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener área: ${err.message}`);
    }
  }

  // Crear nueva área
  static async createArea(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("nombre", sql.VarChar(50), data.nombre)
        .input("responsable", sql.Int, data.responsable || null)
        .query(
          `INSERT INTO area (nombre, responsable)
           VALUES (@nombre, @responsable);
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getAreaById(newId);
    } catch (err) {
      throw new Error(`Error al crear área: ${err.message}`);
    }
  }

  // Actualizar área
  static async updateArea(id, data) {
    try {
      const pool = await poolPromise;

      await pool
        .request()
        .input("id", sql.Int, id)
        .input("nombre", sql.VarChar(50), data.nombre)
        .input("responsable", sql.Int, data.responsable || null)
        .query(
          `UPDATE area
           SET nombre = @nombre, responsable = @responsable
           WHERE id = @id`
        );

      return await this.getAreaById(id);
    } catch (err) {
      throw new Error(`Error al actualizar área: ${err.message}`);
    }
  }

  // Eliminar área
  static async deleteArea(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM area WHERE id = @id");
      return { message: "Área eliminada correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar área: ${err.message}`);
    }
  }
}

export default AreaModel;
