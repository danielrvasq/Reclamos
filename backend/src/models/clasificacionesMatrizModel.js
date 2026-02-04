import { sql, poolPromise } from "../config/server.js";

class ClasificacionesMatrizModel {
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, nombre, activo
         FROM clasificaciones_matriz
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error al obtener clasificaciones matriz: ${err.message}`
      );
    }
  }

  static async getById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, nombre, activo
           FROM clasificaciones_matriz
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener clasificacion matriz: ${err.message}`);
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("nombre", sql.NVarChar(255), data.nombre || null)
        .input("activo", sql.Bit, data.activo ?? true)
        .query(
          `INSERT INTO clasificaciones_matriz (nombre, activo)
           VALUES (@nombre, @activo);
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear clasificacion matriz: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("nombre", sql.NVarChar(255), data.nombre || null)
        .input("activo", sql.Bit, data.activo ?? null)
        .query(
          `UPDATE clasificaciones_matriz
           SET nombre = @nombre,
               activo = COALESCE(@activo, activo)
           WHERE id = @id`
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(
        `Error al actualizar clasificacion matriz: ${err.message}`
      );
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM clasificaciones_matriz WHERE id = @id");
      return { message: "Clasificacion matriz eliminada correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar clasificacion matriz: ${err.message}`);
    }
  }
}

export default ClasificacionesMatrizModel;
