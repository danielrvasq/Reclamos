import { sql, poolPromise } from "../config/server.js";

class MatrizDireccionamientoModel {
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT m.id,
                m.clasificacion_id,
                m.clase_id,
                m.causa_id,
                m.primer_contacto_id,
                u1.nombre AS primer_contacto_nombre,
                m.tiempo_atencion_inicial_dias,
                m.responsable_tratamiento_id,
                u2.nombre AS responsable_tratamiento_nombre,
                m.correo_responsable,
                m.tiempo_respuesta_dias,
                m.tipo_respuesta,
                m.activo,
                m.created_at
         FROM matriz_direccionamiento m
         LEFT JOIN usuarios u1 ON m.primer_contacto_id = u1.id
         LEFT JOIN usuarios u2 ON m.responsable_tratamiento_id = u2.id
         ORDER BY m.clasificacion_id, m.clase_id, m.causa_id`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error al obtener matriz direccionamiento: ${err.message}`
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
          `SELECT m.id,
            m.clasificacion_id,
            m.clase_id,
            m.causa_id,
            m.primer_contacto_id,
            u1.nombre AS primer_contacto_nombre,
            m.tiempo_atencion_inicial_dias,
            m.responsable_tratamiento_id,
            u2.nombre AS responsable_tratamiento_nombre,
            m.correo_responsable,
            m.tiempo_respuesta_dias,
            m.tipo_respuesta,
            m.activo,
            m.created_at
           FROM matriz_direccionamiento m
           LEFT JOIN usuarios u1 ON m.primer_contacto_id = u1.id
           LEFT JOIN usuarios u2 ON m.responsable_tratamiento_id = u2.id
           WHERE m.id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(
        `Error al obtener matriz direccionamiento: ${err.message}`
      );
    }
  }

  static async findByClasificacion(clasificacionId, claseId, causaId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("clasificacionId", sql.Int, clasificacionId || null)
        .input("claseId", sql.Int, claseId || null)
        .input("causaId", sql.Int, causaId || null)
        .query(
          `SELECT TOP 1 m.id,
                  m.clasificacion_id,
                  m.clase_id,
                  m.causa_id,
                  m.primer_contacto_id,
                  u1.nombre AS primer_contacto_nombre,
                  m.tiempo_atencion_inicial_dias,
                  m.responsable_tratamiento_id,
                  u2.nombre AS responsable_tratamiento_nombre,
                  m.correo_responsable,
                  m.tiempo_respuesta_dias,
                  m.tipo_respuesta,
                  m.activo,
                  m.created_at
           FROM matriz_direccionamiento m
           LEFT JOIN usuarios u1 ON m.primer_contacto_id = u1.id
           LEFT JOIN usuarios u2 ON m.responsable_tratamiento_id = u2.id
           WHERE (@clasificacionId IS NULL OR m.clasificacion_id = @clasificacionId)
             AND (@claseId IS NULL OR m.clase_id = @claseId)
             AND (@causaId IS NULL OR m.causa_id = @causaId)
             AND m.activo = 1`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(
        `Error al buscar matriz direccionamiento: ${err.message}`
      );
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("clasificacionId", sql.Int, data.clasificacion_id)
        .input("claseId", sql.Int, data.clase_id)
        .input("causaId", sql.Int, data.causa_id)
        .input("primerContactoId", sql.Int, data.primer_contacto_id ?? null)
        .input(
          "tiempoAtencionInicial",
          sql.Int,
          data.tiempo_atencion_inicial_dias ?? null
        )
        .input(
          "respTratamientoId",
          sql.Int,
          data.responsable_tratamiento_id ?? null
        )
        .input(
          "correoResponsable",
          sql.NVarChar(255),
          data.correo_responsable || null
        )
        .input("tiempoRespuesta", sql.Int, data.tiempo_respuesta_dias ?? null)
        .input("tipoRespuesta", sql.NVarChar(255), data.tipo_respuesta || null)
        .input("activo", sql.Bit, data.activo ?? true)
        .input("createdAt", sql.DateTime, data.created_at || new Date())
        .query(
          `INSERT INTO matriz_direccionamiento (
             clasificacion_id, clase_id, causa_id,
             primer_contacto_id, tiempo_atencion_inicial_dias,
             responsable_tratamiento_id, correo_responsable,
             tiempo_respuesta_dias, tipo_respuesta, activo, created_at
           ) VALUES (
             @clasificacionId, @claseId, @causaId,
             @primerContactoId, @tiempoAtencionInicial,
             @respTratamientoId, @correoResponsable,
             @tiempoRespuesta, @tipoRespuesta, @activo, @createdAt
           );
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear matriz direccionamiento: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("clasificacionId", sql.Int, data.clasificacion_id ?? null)
        .input("claseId", sql.Int, data.clase_id ?? null)
        .input("causaId", sql.Int, data.causa_id ?? null)
        .input("primerContactoId", sql.Int, data.primer_contacto_id ?? null)
        .input(
          "tiempoAtencionInicial",
          sql.Int,
          data.tiempo_atencion_inicial_dias ?? null
        )
        .input(
          "respTratamientoId",
          sql.Int,
          data.responsable_tratamiento_id ?? null
        )
        .input(
          "correoResponsable",
          sql.NVarChar(255),
          data.correo_responsable || null
        )
        .input("tiempoRespuesta", sql.Int, data.tiempo_respuesta_dias ?? null)
        .input("tipoRespuesta", sql.NVarChar(255), data.tipo_respuesta || null)
        .input("activo", sql.Bit, data.activo ?? null)
        .query(
          `UPDATE matriz_direccionamiento
           SET clasificacion_id = COALESCE(@clasificacionId, clasificacion_id),
               clase_id = COALESCE(@claseId, clase_id),
               causa_id = COALESCE(@causaId, causa_id),
               primer_contacto_id = COALESCE(@primerContactoId, primer_contacto_id),
               tiempo_atencion_inicial_dias = COALESCE(@tiempoAtencionInicial, tiempo_atencion_inicial_dias),
               responsable_tratamiento_id = COALESCE(@respTratamientoId, responsable_tratamiento_id),
               correo_responsable = COALESCE(@correoResponsable, correo_responsable),
               tiempo_respuesta_dias = COALESCE(@tiempoRespuesta, tiempo_respuesta_dias),
               tipo_respuesta = COALESCE(@tipoRespuesta, tipo_respuesta),
               activo = COALESCE(@activo, activo)
           WHERE id = @id`
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(
        `Error al actualizar matriz direccionamiento: ${err.message}`
      );
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM matriz_direccionamiento WHERE id = @id");
      return { message: "Matriz direccionamiento eliminada correctamente" };
    } catch (err) {
      throw new Error(
        `Error al eliminar matriz direccionamiento: ${err.message}`
      );
    }
  }
}

export default MatrizDireccionamientoModel;
