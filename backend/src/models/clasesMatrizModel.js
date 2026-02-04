import { sql, poolPromise } from "../config/server.js";

class ClasesMatrizModel {
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, clasificacion_id, nombre, activo
         FROM clases_matriz
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener clases matriz: ${err.message}`);
    }
  }

  static async getById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, clasificacion_id, nombre, activo
           FROM clases_matriz
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener clase matriz: ${err.message}`);
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("clasificacionId", sql.Int, data.clasificacion_id || null)
        .input("nombre", sql.NVarChar(255), data.nombre || null)
        .input("activo", sql.Bit, data.activo ?? true)
        .query(
          `INSERT INTO clases_matriz (clasificacion_id, nombre, activo)
           VALUES (@clasificacionId, @nombre, @activo);
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear clase matriz: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("clasificacionId", sql.Int, data.clasificacion_id || null)
        .input("nombre", sql.NVarChar(255), data.nombre || null)
        .input("activo", sql.Bit, data.activo ?? null)
        .query(
          `UPDATE clases_matriz
           SET clasificacion_id = @clasificacionId,
               nombre = @nombre,
               activo = COALESCE(@activo, activo)
           WHERE id = @id`
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar clase matriz: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM clases_matriz WHERE id = @id");
      return { message: "Clase matriz eliminada correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar clase matriz: ${err.message}`);
    }
  }
}

export default ClasesMatrizModel;
