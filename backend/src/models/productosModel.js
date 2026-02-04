import { sql, poolPromise } from "../config/server.js";

class ProductosModel {
  // Obtener todos los productos
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, codigo, nombre, descripcion, tipo_producto_id, activo, created_at
         FROM productos
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener productos: ${err.message}`);
    }
  }

  // Obtener por ID
  static async getById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, codigo, nombre, descripcion, tipo_producto_id, activo, created_at
           FROM productos
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener producto: ${err.message}`);
    }
  }

  // Crear
  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("codigo", sql.NVarChar(255), data.codigo || null)
        .input("nombre", sql.NVarChar(255), data.nombre)
        .input("descripcion", sql.NVarChar(255), data.descripcion || null)
        .input("tipoProductoId", sql.Int, data.tipo_producto_id || null)
        .input("activo", sql.Bit, data.activo ?? true)
        .query(
          `INSERT INTO productos (codigo, nombre, descripcion, tipo_producto_id, activo, created_at)
           VALUES (@codigo, @nombre, @descripcion, @tipoProductoId, @activo, GETDATE());
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear producto: ${err.message}`);
    }
  }

  // Actualizar
  static async update(id, data) {
    try {
      const pool = await poolPromise;

      await pool
        .request()
        .input("id", sql.Int, id)
        .input("codigo", sql.NVarChar(255), data.codigo || null)
        .input("nombre", sql.NVarChar(255), data.nombre)
        .input("descripcion", sql.NVarChar(255), data.descripcion || null)
        .input("tipoProductoId", sql.Int, data.tipo_producto_id || null)
        .input("activo", sql.Bit, data.activo ?? null)
        .query(
          `UPDATE productos
           SET codigo = @codigo,
               nombre = @nombre,
               descripcion = @descripcion,
               tipo_producto_id = @tipoProductoId,
               activo = COALESCE(@activo, activo)
           WHERE id = @id`
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar producto: ${err.message}`);
    }
  }

  // Eliminar
  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM productos WHERE id = @id");
      return { message: "Producto eliminado correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar producto: ${err.message}`);
    }
  }
}

export default ProductosModel;
