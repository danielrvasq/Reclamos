import { sql, poolPromise } from "../config/server.js";

class RegistrosModel {
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, formulario_id, usuario_id, accion, observacion, fecha
         FROM registros
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener registros: ${err.message}`);
    }
  }

  static async getById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, formulario_id, usuario_id, accion, observacion, fecha
           FROM registros
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener registro: ${err.message}`);
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("formularioId", sql.Int, data.formulario_id)
        .input("usuarioId", sql.Int, data.usuario_id)
        .input("accion", sql.NVarChar(255), data.accion || null)
        .input("observacion", sql.NVarChar(sql.MAX), data.observacion || null)
        .input("fecha", sql.DateTime, data.fecha || new Date())
        .query(
          `INSERT INTO registros (formulario_id, usuario_id, accion, observacion, fecha)
           VALUES (@formularioId, @usuarioId, @accion, @observacion, @fecha);
           SELECT SCOPE_IDENTITY() as id;`
        );
      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear registro: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("formularioId", sql.Int, data.formulario_id)
        .input("usuarioId", sql.Int, data.usuario_id)
        .input("accion", sql.NVarChar(255), data.accion || null)
        .input("observacion", sql.NVarChar(sql.MAX), data.observacion || null)
        .input("fecha", sql.DateTime, data.fecha || new Date())
        .query(
          `UPDATE registros
           SET formulario_id = @formularioId,
               usuario_id = @usuarioId,
               accion = @accion,
               observacion = @observacion,
               fecha = @fecha
           WHERE id = @id`
        );
      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar registro: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM registros WHERE id = @id");
      return { message: "Registro eliminado correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar registro: ${err.message}`);
    }
  }
}

export default RegistrosModel;
