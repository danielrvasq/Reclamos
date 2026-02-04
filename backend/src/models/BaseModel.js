import { sql, poolPromise } from "../config/server.js";

/**
 * Modelo base con operaciones CRUD genéricas
 * Reduce código repetitivo en todos los modelos
 */
class BaseModel {
  /**
   * @param {string} tableName - Nombre de la tabla en la BD
   * @param {Array<Object>} fields - Definición de campos [{name, sqlType, param}]
   */
  constructor(tableName, fields) {
    this.tableName = tableName;
    this.fields = fields;
  }

  /**
   * Obtener todos los registros
   */
  async getAll() {
    try {
      const pool = await poolPromise;
      const fieldNames = this.fields.map((f) => f.name).join(", ");
      const result = await pool
        .request()
        .query(`SELECT ${fieldNames} FROM ${this.tableName} ORDER BY id DESC`);
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener ${this.tableName}: ${err.message}`);
    }
  }

  /**
   * Obtener un registro por ID
   */
  async getById(id) {
    try {
      const pool = await poolPromise;
      const fieldNames = this.fields.map((f) => f.name).join(", ");
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(`SELECT ${fieldNames} FROM ${this.tableName} WHERE id = @id`);
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener ${this.tableName}: ${err.message}`);
    }
  }

  /**
   * Crear un nuevo registro
   */
  async create(data) {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      // Preparar campos e inputs
      const insertFields = [];
      const insertParams = [];

      this.fields.forEach((field) => {
        if (field.name !== "id") {
          insertFields.push(field.name);
          insertParams.push(`@${field.param}`);

          let value =
            data[field.param] !== undefined ? data[field.param] : null;

          // Manejo especial de fechas
          if (field.sqlType === sql.DateTime || field.sqlType === sql.Date) {
            if (value && !(value instanceof Date)) {
              value = new Date(value);
            }
          }

          request.input(field.param, field.sqlType, value);
        }
      });

      const query = `
        INSERT INTO ${this.tableName} (${insertFields.join(", ")})
        VALUES (${insertParams.join(", ")});
        SELECT SCOPE_IDENTITY() as id;
      `;

      const result = await request.query(query);
      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear ${this.tableName}: ${err.message}`);
    }
  }

  /**
   * Actualizar un registro
   */
  async update(id, data) {
    try {
      const pool = await poolPromise;
      const request = pool.request();
      request.input("id", sql.Int, id);

      const updateClauses = [];

      this.fields.forEach((field) => {
        if (field.name !== "id" && data[field.param] !== undefined) {
          updateClauses.push(`${field.name} = @${field.param}`);

          let value = data[field.param];

          // Manejo especial de fechas
          if (field.sqlType === sql.DateTime || field.sqlType === sql.Date) {
            if (value && !(value instanceof Date)) {
              value = new Date(value);
            }
          }

          request.input(field.param, field.sqlType, value);
        }
      });

      if (updateClauses.length > 0) {
        const query = `
          UPDATE ${this.tableName}
          SET ${updateClauses.join(", ")}
          WHERE id = @id
        `;
        await request.query(query);
      }

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar ${this.tableName}: ${err.message}`);
    }
  }

  /**
   * Eliminar un registro
   */
  async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query(`DELETE FROM ${this.tableName} WHERE id = @id`);
      return { message: `${this.tableName} eliminado correctamente` };
    } catch (err) {
      throw new Error(`Error al eliminar ${this.tableName}: ${err.message}`);
    }
  }
}

export default BaseModel;
