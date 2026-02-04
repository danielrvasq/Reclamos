import { sql, poolPromise } from "../config/server.js";

class TiposProductoModel {
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, nombre, activo, created_at
         FROM tipos_producto
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener tipos de producto: ${err.message}`);
    }
  }

  static async getById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, nombre, activo, created_at
           FROM tipos_producto
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener tipo de producto: ${err.message}`);
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("nombre", sql.NVarChar(255), data.nombre)
        .input("activo", sql.Bit, data.activo ?? true)
        .query(
          `INSERT INTO tipos_producto (nombre, activo, created_at)
           VALUES (@nombre, @activo, GETDATE());
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear tipo de producto: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("nombre", sql.NVarChar(255), data.nombre)
        .input("activo", sql.Bit, data.activo ?? null)
        .query(
          `UPDATE tipos_producto
           SET nombre = @nombre,
               activo = COALESCE(@activo, activo)
           WHERE id = @id`
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar tipo de producto: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM tipos_producto WHERE id = @id");
      return { message: "Tipo de producto eliminado correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar tipo de producto: ${err.message}`);
    }
  }
}

export default TiposProductoModel;
