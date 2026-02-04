import { sql, poolPromise } from "../config/server.js";

class EstadosReclamoModel {
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, codigo, nombre, descripcion, es_final, color, activo
         FROM estados_reclamo
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener estados reclamo: ${err.message}`);
    }
  }

  static async getById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, codigo, nombre, descripcion, es_final, color, activo
           FROM estados_reclamo
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener estado reclamo: ${err.message}`);
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("codigo", sql.NVarChar(255), data.codigo || null)
        .input("nombre", sql.NVarChar(255), data.nombre)
        .input("descripcion", sql.NVarChar(255), data.descripcion || null)
        .input("esFinal", sql.Bit, data.es_final ?? false)
        .input("color", sql.Int, data.color || 1)
        .input("activo", sql.Bit, data.activo ?? true)
        .query(
          `INSERT INTO estados_reclamo (codigo, nombre, descripcion, es_final, color, activo)
           VALUES (@codigo, @nombre, @descripcion, @esFinal, @color, @activo);
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear estado reclamo: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("codigo", sql.NVarChar(255), data.codigo || null)
        .input("nombre", sql.NVarChar(255), data.nombre)
        .input("descripcion", sql.NVarChar(255), data.descripcion || null)
        .input("esFinal", sql.Bit, data.es_final ?? null)
        .input("color", sql.Int, data.color ?? null)
        .input("activo", sql.Bit, data.activo ?? null)
        .query(
          `UPDATE estados_reclamo
           SET codigo = @codigo,
               nombre = @nombre,
               descripcion = @descripcion,
               es_final = COALESCE(@esFinal, es_final),
               color = COALESCE(@color, color),
               activo = COALESCE(@activo, activo)
           WHERE id = @id`
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar estado reclamo: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM estados_reclamo WHERE id = @id");
      return { message: "Estado reclamo eliminado correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar estado reclamo: ${err.message}`);
    }
  }
}

export default EstadosReclamoModel;
