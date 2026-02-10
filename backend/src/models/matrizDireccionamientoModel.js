import { sql, poolPromise } from "../config/server.js";

class MatrizDireccionamientoModel {
  static normalizePrimerContactos(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map((v) => (v !== null && v !== undefined ? parseInt(v, 10) : null))
        .filter((v) => Number.isInteger(v));
    }
    const parsed = parseInt(value, 10);
    return Number.isInteger(parsed) ? [parsed] : [];
  }

  static mapRowsToMatriz(rows) {
    const map = new Map();

    rows.forEach((row) => {
      const existing = map.get(row.id);
      const baseData = existing || {
        id: row.id,
        clasificacion_id: row.clasificacion_id,
        clase_id: row.clase_id,
        causa_id: row.causa_id,
        primer_contacto_ids: [],
        primer_contacto_nombres: [],
        tiempo_atencion_inicial_dias: row.tiempo_atencion_inicial_dias,
        responsable_tratamiento_id: row.responsable_tratamiento_id,
        responsable_tratamiento_nombre: row.responsable_tratamiento_nombre,
        tiempo_respuesta_dias: row.tiempo_respuesta_dias,
        tipo_respuesta: row.tipo_respuesta,
        activo: row.activo,
        created_at: row.created_at,
      };

      if (
        row.primer_contacto_id &&
        !baseData.primer_contacto_ids.includes(row.primer_contacto_id)
      ) {
        baseData.primer_contacto_ids.push(row.primer_contacto_id);
        if (row.primer_contacto_nombre) {
          baseData.primer_contacto_nombres.push(row.primer_contacto_nombre);
        }
      }

      map.set(row.id, baseData);
    });

    return Array.from(map.values()).map((item) => ({
      ...item,
      primer_contacto_id: item.primer_contacto_ids[0] ?? null,
      primer_contacto_nombre: item.primer_contacto_nombres[0] ?? null,
    }));
  }

  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT m.id,
                m.clasificacion_id,
                m.clase_id,
                m.causa_id,
                pc.usuario_id AS primer_contacto_id,
                u1.nombre AS primer_contacto_nombre,
                m.tiempo_atencion_inicial_dias,
                m.responsable_tratamiento_id,
                u2.nombre AS responsable_tratamiento_nombre,
                m.tiempo_respuesta_dias,
                m.tipo_respuesta,
                m.activo,
                m.created_at
         FROM matriz_direccionamiento m
         LEFT JOIN matriz_direccionamiento_primer_contacto pc
           ON pc.matriz_direccionamiento_id = m.id
         LEFT JOIN usuarios u1 ON pc.usuario_id = u1.id
         LEFT JOIN usuarios u2 ON m.responsable_tratamiento_id = u2.id
         ORDER BY m.clasificacion_id, m.clase_id, m.causa_id`
      );
      return this.mapRowsToMatriz(result.recordset);
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
            pc.usuario_id AS primer_contacto_id,
            u1.nombre AS primer_contacto_nombre,
            m.tiempo_atencion_inicial_dias,
            m.responsable_tratamiento_id,
            u2.nombre AS responsable_tratamiento_nombre,
            m.tiempo_respuesta_dias,
            m.tipo_respuesta,
            m.activo,
            m.created_at
           FROM matriz_direccionamiento m
           LEFT JOIN matriz_direccionamiento_primer_contacto pc
             ON pc.matriz_direccionamiento_id = m.id
           LEFT JOIN usuarios u1 ON pc.usuario_id = u1.id
           LEFT JOIN usuarios u2 ON m.responsable_tratamiento_id = u2.id
           WHERE m.id = @id`
        );
      const items = this.mapRowsToMatriz(result.recordset);
      return items[0] || null;
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
          `SELECT m.id,
                  m.clasificacion_id,
                  m.clase_id,
                  m.causa_id,
                  pc.usuario_id AS primer_contacto_id,
                  u1.nombre AS primer_contacto_nombre,
                  m.tiempo_atencion_inicial_dias,
                  m.responsable_tratamiento_id,
                  u2.nombre AS responsable_tratamiento_nombre,
                  m.tiempo_respuesta_dias,
                  m.tipo_respuesta,
                  m.activo,
                  m.created_at
           FROM matriz_direccionamiento m
           LEFT JOIN matriz_direccionamiento_primer_contacto pc
             ON pc.matriz_direccionamiento_id = m.id
           LEFT JOIN usuarios u1 ON pc.usuario_id = u1.id
           LEFT JOIN usuarios u2 ON m.responsable_tratamiento_id = u2.id
           WHERE (@clasificacionId IS NULL OR m.clasificacion_id = @clasificacionId)
             AND (@claseId IS NULL OR m.clase_id = @claseId)
             AND (@causaId IS NULL OR m.causa_id = @causaId)
             AND m.activo = 1
           ORDER BY m.id`
        );
      const items = this.mapRowsToMatriz(result.recordset);
      return items[0] || null;
    } catch (err) {
      throw new Error(
        `Error al buscar matriz direccionamiento: ${err.message}`
      );
    }
  }

  static async replacePrimerContactos(
    transaction,
    matrizId,
    primerContactoIds
  ) {
    const ids = this.normalizePrimerContactos(primerContactoIds);
    const request = new sql.Request(transaction);

    await request
      .input("matrizId", sql.Int, matrizId)
      .query(
        "DELETE FROM matriz_direccionamiento_primer_contacto WHERE matriz_direccionamiento_id = @matrizId"
      );

    if (ids.length === 0) return;

    for (const userId of ids) {
      await new sql.Request(transaction)
        .input("matrizId", sql.Int, matrizId)
        .input("usuarioId", sql.Int, userId)
        .query(
          `INSERT INTO matriz_direccionamiento_primer_contacto
           (matriz_direccionamiento_id, usuario_id)
           VALUES (@matrizId, @usuarioId)`
        );
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const primerContactoIds = this.normalizePrimerContactos(
        data.primer_contacto_ids ?? data.primer_contacto_id
      );
      const primerContactoId = primerContactoIds[0] ?? null;

      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        const result = await new sql.Request(transaction)
          .input("clasificacionId", sql.Int, data.clasificacion_id)
          .input("claseId", sql.Int, data.clase_id)
          .input("causaId", sql.Int, data.causa_id)
          .input("primerContactoId", sql.Int, primerContactoId)
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
          .input("tiempoRespuesta", sql.Int, data.tiempo_respuesta_dias ?? null)
          .input(
            "tipoRespuesta",
            sql.NVarChar(255),
            data.tipo_respuesta || null
          )
          .input("activo", sql.Bit, data.activo ?? true)
          .input("createdAt", sql.DateTime, data.created_at || new Date())
          .query(
            `INSERT INTO matriz_direccionamiento (
               clasificacion_id, clase_id, causa_id,
               primer_contacto_id, tiempo_atencion_inicial_dias,
               responsable_tratamiento_id,
               tiempo_respuesta_dias, tipo_respuesta, activo, created_at
             ) VALUES (
               @clasificacionId, @claseId, @causaId,
               @primerContactoId, @tiempoAtencionInicial,
               @respTratamientoId,
               @tiempoRespuesta, @tipoRespuesta, @activo, @createdAt
             );
             SELECT SCOPE_IDENTITY() as id;`
          );

        const newId = result.recordset[0]?.id;
        if (newId && primerContactoIds.length > 0) {
          await this.replacePrimerContactos(
            transaction,
            newId,
            primerContactoIds
          );
        }

        await transaction.commit();
        return await this.getById(newId);
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (err) {
      throw new Error(`Error al crear matriz direccionamiento: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      const primerContactoIds = this.normalizePrimerContactos(
        data.primer_contacto_ids ?? data.primer_contacto_id
      );
      const primerContactoId = primerContactoIds[0] ?? null;

      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        await new sql.Request(transaction)
          .input("id", sql.Int, id)
          .input("clasificacionId", sql.Int, data.clasificacion_id ?? null)
          .input("claseId", sql.Int, data.clase_id ?? null)
          .input("causaId", sql.Int, data.causa_id ?? null)
          .input("primerContactoId", sql.Int, primerContactoId ?? null)
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
          .input("tiempoRespuesta", sql.Int, data.tiempo_respuesta_dias ?? null)
          .input(
            "tipoRespuesta",
            sql.NVarChar(255),
            data.tipo_respuesta || null
          )
          .input("activo", sql.Bit, data.activo ?? null)
          .query(
            `UPDATE matriz_direccionamiento
             SET clasificacion_id = COALESCE(@clasificacionId, clasificacion_id),
                 clase_id = COALESCE(@claseId, clase_id),
                 causa_id = COALESCE(@causaId, causa_id),
                 primer_contacto_id = COALESCE(@primerContactoId, primer_contacto_id),
                 tiempo_atencion_inicial_dias = COALESCE(@tiempoAtencionInicial, tiempo_atencion_inicial_dias),
                 responsable_tratamiento_id = COALESCE(@respTratamientoId, responsable_tratamiento_id),
                 tiempo_respuesta_dias = COALESCE(@tiempoRespuesta, tiempo_respuesta_dias),
                 tipo_respuesta = COALESCE(@tipoRespuesta, tipo_respuesta),
                 activo = COALESCE(@activo, activo)
             WHERE id = @id`
          );

        if (
          data.hasOwnProperty("primer_contacto_ids") ||
          data.hasOwnProperty("primer_contacto_id")
        ) {
          await this.replacePrimerContactos(transaction, id, primerContactoIds);
        }

        await transaction.commit();
        return await this.getById(id);
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (err) {
      throw new Error(
        `Error al actualizar matriz direccionamiento: ${err.message}`
      );
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        await new sql.Request(transaction)
          .input("id", sql.Int, id)
          .query(
            "DELETE FROM matriz_direccionamiento_primer_contacto WHERE matriz_direccionamiento_id = @id"
          );

        await new sql.Request(transaction)
          .input("id", sql.Int, id)
          .query("DELETE FROM matriz_direccionamiento WHERE id = @id");

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
      return { message: "Matriz direccionamiento eliminada correctamente" };
    } catch (err) {
      throw new Error(
        `Error al eliminar matriz direccionamiento: ${err.message}`
      );
    }
  }
}

export default MatrizDireccionamientoModel;
