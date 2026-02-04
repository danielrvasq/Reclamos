import { sql, poolPromise } from "../config/server.js";

class CausasMatrizModel {
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, clase_id, nombre, activo
         FROM causas_matriz
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener causas matriz: ${err.message}`);
    }
  }

  static async getById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, clase_id, nombre, activo
           FROM causas_matriz
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener causa matriz: ${err.message}`);
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("claseId", sql.Int, data.clase_id || null)
        .input("nombre", sql.NVarChar(255), data.nombre || null)
        .input("activo", sql.Bit, data.activo ?? true)
        .query(
          `INSERT INTO causas_matriz (clase_id, nombre, activo)
           VALUES (@claseId, @nombre, @activo);
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear causa matriz: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("claseId", sql.Int, data.clase_id || null)
        .input("nombre", sql.NVarChar(255), data.nombre || null)
        .input("activo", sql.Bit, data.activo ?? null)
        .query(
          `UPDATE causas_matriz
           SET clase_id = @claseId,
               nombre = @nombre,
               activo = COALESCE(@activo, activo)
           WHERE id = @id`
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar causa matriz: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM causas_matriz WHERE id = @id");
      return { message: "Causa matriz eliminada correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar causa matriz: ${err.message}`);
    }
  }
}

export default CausasMatrizModel;
