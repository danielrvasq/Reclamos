import { sql, poolPromise } from "../config/server.js";
import MatrizDireccionamientoModel from "./matrizDireccionamientoModel.js";

class FormulariosModel {
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        `SELECT id, producto_id, estado_id, asesor, fecha_creacion,
                tiempo_respuesta, fecha_limite_teorico,
                diferencia, cumplimiento, proceso_responsable, persona_responsable,
                cliente, departamento, ciudad, nombre_contacto, cargo,
                telefono, celular, correo_electronico, producto,
                no_pedido, no_remision, fecha_despacho, via_ingreso,
                descripcion_caso, calificacion, justificado, incertidumbre,
                no_justificado, clasificacion_id, clase_id, causa_id,
                observaciones_primer_contacto, avance_proceso_responsable,
                  ccpa, solucion_final, dias_habiles_demora,
            fecha_cierre_definitiva, observaciones, creado_por, activo, created_at
         FROM reclamos
         WHERE activo = 1
         ORDER BY id DESC`
      );
      return result.recordset;
    } catch (err) {
      throw new Error(`Error al obtener reclamos: ${err.message}`);
    }
  }

  static async getById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query(
          `SELECT id, producto_id, estado_id, asesor, fecha_creacion,
                  tiempo_respuesta, fecha_limite_teorico,
                  diferencia, cumplimiento, proceso_responsable, persona_responsable,
                  cliente, departamento, ciudad, nombre_contacto, cargo,
                  telefono, celular, correo_electronico, producto,
                  no_pedido, no_remision, fecha_despacho, via_ingreso,
                  descripcion_caso, calificacion, justificado, incertidumbre,
                  no_justificado, clasificacion_id, clase_id, causa_id,
                  observaciones_primer_contacto, avance_proceso_responsable,
                      ccpa, solucion_final, dias_habiles_demora,
                  fecha_cierre_definitiva, observaciones, creado_por, activo, created_at
           FROM reclamos
           WHERE id = @id`
        );
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error al obtener reclamo: ${err.message}`);
    }
  }

  static async create(data) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("productoId", sql.Int, data.producto_id)
        .input("estadoId", sql.Int, data.estado_id)
        .input("asesor", sql.NVarChar(255), data.asesor || null)
        .input("fechaCreacion", sql.DateTime, data.fecha_creacion || new Date())
        .input("tiempoRespuesta", sql.Int, data.tiempo_respuesta || null)
        .input(
          "fechaLimiteTeorico",
          sql.Date,
          data.fecha_limite_teorico || null
        )
        .input("diferencia", sql.Int, data.diferencia || null)
        .input("cumplimiento", sql.Bit, data.cumplimiento ?? null)
        .input("procesoResponsable", sql.Int, data.proceso_responsable || null)
        .input("personaResponsable", sql.Int, data.persona_responsable || null)
        .input("cliente", sql.NVarChar(255), data.cliente || null)
        .input("departamento", sql.NVarChar(255), data.departamento || null)
        .input("ciudad", sql.NVarChar(255), data.ciudad || null)
        .input(
          "nombreContacto",
          sql.NVarChar(255),
          data.nombre_contacto || null
        )
        .input("cargo", sql.NVarChar(255), data.cargo || null)
        .input("telefono", sql.NVarChar(255), data.telefono || null)
        .input("celular", sql.NVarChar(255), data.celular || null)
        .input(
          "correoElectronico",
          sql.NVarChar(255),
          data.correo_electronico || null
        )
        .input("producto", sql.NVarChar(255), data.producto || null)
        .input("noPedido", sql.NVarChar(255), data.no_pedido || null)
        .input("noRemision", sql.NVarChar(255), data.no_remision || null)
        .input("fechaDespacho", sql.Date, data.fecha_despacho || null)
        .input("viaIngreso", sql.NVarChar(255), data.via_ingreso || null)
        .input(
          "descripcionCaso",
          sql.NVarChar(sql.MAX),
          data.descripcion_caso || null
        )
        .input("calificacion", sql.NVarChar(255), data.calificacion || null)
        .input("justificado", sql.Bit, data.justificado ?? null)
        .input("incertidumbre", sql.Bit, data.incertidumbre ?? null)
        .input("noJustificado", sql.Bit, data.no_justificado ?? null)
        .input("clasificacionId", sql.Int, data.clasificacion_id || null)
        .input("claseId", sql.Int, data.clase_id || null)
        .input("causaId", sql.Int, data.causa_id || null)
        .input(
          "observacionesPrimerContacto",
          sql.NVarChar(sql.MAX),
          data.observaciones_primer_contacto || null
        )
        .input(
          "avanceProceso",
          sql.NVarChar(sql.MAX),
          data.avance_proceso_responsable || null
        )
        .input("ccpa", sql.NVarChar(255), data.ccpa || null)
        .input(
          "solucionFinal",
          sql.NVarChar(sql.MAX),
          data.solucion_final || null
        )
        .input("diasHabilesDemora", sql.Int, data.dias_habiles_demora || null)
        .input(
          "fechaCierreDefinitiva",
          sql.Date,
          data.fecha_cierre_definitiva || null
        )
        .input(
          "observaciones",
          sql.NVarChar(sql.MAX),
          data.observaciones || null
        )
        .input("creadoPor", sql.Int, data.creado_por || null)
        .input("createdAt", sql.DateTime, data.created_at || new Date())
        .query(
          `INSERT INTO reclamos (
             producto_id, estado_id, asesor, fecha_creacion, tiempo_respuesta, fecha_limite_teorico,
             diferencia, cumplimiento, proceso_responsable, persona_responsable,
             cliente, departamento, ciudad, nombre_contacto, cargo,
             telefono, celular, correo_electronico, producto,
             no_pedido, no_remision, fecha_despacho, via_ingreso,
             descripcion_caso, calificacion, justificado, incertidumbre,
             no_justificado, clasificacion_id, clase_id, causa_id,
             observaciones_primer_contacto, avance_proceso_responsable,
             ccpa, solucion_final, dias_habiles_demora,
             fecha_cierre_definitiva, observaciones, creado_por, created_at
           ) VALUES (
             @productoId, @estadoId, @asesor, @fechaCreacion,
             @tiempoRespuesta, @fechaLimiteTeorico,
             @diferencia, @cumplimiento, @procesoResponsable, @personaResponsable,
             @cliente, @departamento, @ciudad, @nombreContacto, @cargo,
             @telefono, @celular, @correoElectronico, @producto,
             @noPedido, @noRemision, @fechaDespacho, @viaIngreso,
             @descripcionCaso, @calificacion, @justificado, @incertidumbre,
             @noJustificado, @clasificacionId, @claseId, @causaId,
             @observacionesPrimerContacto, @avanceProceso,
             @ccpa, @solucionFinal, @diasHabilesDemora,
             @fechaCierreDefinitiva, @observaciones, @creadoPor, @createdAt
           );
           SELECT SCOPE_IDENTITY() as id;`
        );

      const newId = result.recordset[0]?.id;
      return await this.getById(newId);
    } catch (err) {
      throw new Error(`Error al crear reclamo: ${err.message}`);
    }
  }

  static async update(id, data) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("productoId", sql.Int, data.producto_id)
        .input("estadoId", sql.Int, data.estado_id)
        .input("asesor", sql.NVarChar(255), data.asesor || null)
        .input("tiempoRespuesta", sql.Int, data.tiempo_respuesta || null)
        .input(
          "fechaLimiteTeorico",
          sql.Date,
          data.fecha_limite_teorico || null
        )
        .input("diferencia", sql.Int, data.diferencia || null)
        .input("cumplimiento", sql.Bit, data.cumplimiento ?? null)
        .input("procesoResponsable", sql.Int, data.proceso_responsable || null)
        .input("personaResponsable", sql.Int, data.persona_responsable || null)
        .input("cliente", sql.NVarChar(255), data.cliente || null)
        .input("departamento", sql.NVarChar(255), data.departamento || null)
        .input("ciudad", sql.NVarChar(255), data.ciudad || null)
        .input(
          "nombreContacto",
          sql.NVarChar(255),
          data.nombre_contacto || null
        )
        .input("cargo", sql.NVarChar(255), data.cargo || null)
        .input("telefono", sql.NVarChar(255), data.telefono || null)
        .input("celular", sql.NVarChar(255), data.celular || null)
        .input(
          "correoElectronico",
          sql.NVarChar(255),
          data.correo_electronico || null
        )
        .input("producto", sql.NVarChar(255), data.producto || null)
        .input("noPedido", sql.NVarChar(255), data.no_pedido || null)
        .input("noRemision", sql.NVarChar(255), data.no_remision || null)
        .input("fechaDespacho", sql.Date, data.fecha_despacho || null)
        .input("viaIngreso", sql.NVarChar(255), data.via_ingreso || null)
        .input(
          "descripcionCaso",
          sql.NVarChar(sql.MAX),
          data.descripcion_caso || null
        )
        .input("calificacion", sql.NVarChar(255), data.calificacion || null)
        .input("justificado", sql.Bit, data.justificado ?? null)
        .input("incertidumbre", sql.Bit, data.incertidumbre ?? null)
        .input("noJustificado", sql.Bit, data.no_justificado ?? null)
        .input("clasificacionId", sql.Int, data.clasificacion_id || null)
        .input("claseId", sql.Int, data.clase_id || null)
        .input("causaId", sql.Int, data.causa_id || null)
        .input(
          "observacionesPrimerContacto",
          sql.NVarChar(sql.MAX),
          data.observaciones_primer_contacto || null
        )
        .input(
          "avanceProceso",
          sql.NVarChar(sql.MAX),
          data.avance_proceso_responsable || null
        )
        .input("ccpa", sql.NVarChar(255), data.ccpa || null)
        .input(
          "solucionFinal",
          sql.NVarChar(sql.MAX),
          data.solucion_final || null
        )
        .input("diasHabilesDemora", sql.Int, data.dias_habiles_demora || null)
        .input(
          "fechaCierreDefinitiva",
          sql.Date,
          data.fecha_cierre_definitiva || null
        )
        .input(
          "observaciones",
          sql.NVarChar(sql.MAX),
          data.observaciones || null
        )
        .input("creadoPor", sql.Int, data.creado_por || null)
        .query(
          `UPDATE reclamos
           SET producto_id = @productoId,
               estado_id = @estadoId,
               asesor = @asesor,
               tiempo_respuesta = @tiempoRespuesta,
               fecha_limite_teorico = @fechaLimiteTeorico,
               diferencia = @diferencia,
               cumplimiento = COALESCE(@cumplimiento, cumplimiento),
               proceso_responsable = @procesoResponsable,
               persona_responsable = @personaResponsable,
               cliente = @cliente,
               departamento = @departamento,
               ciudad = @ciudad,
               nombre_contacto = @nombreContacto,
               cargo = @cargo,
               telefono = @telefono,
               celular = @celular,
               correo_electronico = @correoElectronico,
               producto = @producto,
               no_pedido = @noPedido,
               no_remision = @noRemision,
               fecha_despacho = @fechaDespacho,
               via_ingreso = @viaIngreso,
               descripcion_caso = @descripcionCaso,
               calificacion = @calificacion,
               justificado = COALESCE(@justificado, justificado),
               incertidumbre = COALESCE(@incertidumbre, incertidumbre),
               no_justificado = COALESCE(@noJustificado, no_justificado),
               clasificacion_id = @clasificacionId,
               clase_id = @claseId,
               causa_id = @causaId,
               observaciones_primer_contacto = @observacionesPrimerContacto,
               avance_proceso_responsable = @avanceProceso,
               ccpa = @ccpa,
               solucion_final = @solucionFinal,
               dias_habiles_demora = @diasHabilesDemora,
               fecha_cierre_definitiva = @fechaCierreDefinitiva,
                 observaciones = COALESCE(@observaciones, observaciones),
               creado_por = @creadoPor
           WHERE id = @id`
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar reclamo: ${err.message}`);
    }
  }

  static async updatePartial(id, data) {
    try {
      const pool = await poolPromise;
      const request = pool.request().input("id", sql.Int, id);

      // Obtener el reclamo actual para verificar el estado
      const reclamoActual = await this.getById(id);
      if (!reclamoActual) {
        throw new Error("Reclamo no encontrado");
      }

      // Construir dinámicamente el SET de UPDATE con solo los campos proporcionados
      const setClauses = [];

      if (data.hasOwnProperty("avance_proceso_responsable")) {
        setClauses.push("avance_proceso_responsable = @avanceProceso");
        request.input(
          "avanceProceso",
          sql.NVarChar(sql.MAX),
          data.avance_proceso_responsable || null
        );
      }

      if (data.hasOwnProperty("solucion_final")) {
        setClauses.push("solucion_final = @solucionFinal");
        request.input(
          "solucionFinal",
          sql.NVarChar(sql.MAX),
          data.solucion_final || null
        );

        // Cambio automático de estado: Tratamiento (7) → Pendiente de revisión (24)
        if (reclamoActual.estado_id === 7 && data.solucion_final) {
          setClauses.push("estado_id = 24");
        }
      }

      if (data.hasOwnProperty("fecha_cierre_definitiva")) {
        setClauses.push("fecha_cierre_definitiva = @fechaCierreDefinitiva");
        request.input(
          "fechaCierreDefinitiva",
          sql.Date,
          data.fecha_cierre_definitiva || null
        );

        // Recalcular diferencia y cumplimiento si hay fecha límite teórica
        const fechaCierre = data.fecha_cierre_definitiva
          ? new Date(data.fecha_cierre_definitiva)
          : null;
        const fechaLimite = reclamoActual.fecha_limite_teorico
          ? new Date(reclamoActual.fecha_limite_teorico)
          : null;

        if (fechaCierre && fechaLimite) {
          const diffMs = fechaCierre.getTime() - fechaLimite.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const cumple = fechaCierre.getTime() <= fechaLimite.getTime();

          setClauses.push("diferencia = @diferencia");
          request.input("diferencia", sql.Int, diffDays);

          setClauses.push("cumplimiento = @cumplimiento");
          request.input("cumplimiento", sql.Bit, cumple);
        }
      }

      if (data.hasOwnProperty("dias_habiles_demora")) {
        setClauses.push("dias_habiles_demora = @diasHabilesDemora");
        request.input(
          "diasHabilesDemora",
          sql.Int,
          data.dias_habiles_demora || null
        );
      }

      if (data.hasOwnProperty("observaciones")) {
        setClauses.push("observaciones = @observaciones");
        request.input(
          "observaciones",
          sql.NVarChar(sql.MAX),
          data.observaciones || null
        );
      }

      if (data.hasOwnProperty("observaciones_primer_contacto")) {
        setClauses.push(
          "observaciones_primer_contacto = @observacionesPrimerContacto"
        );
        request.input(
          "observacionesPrimerContacto",
          sql.NVarChar(sql.MAX),
          data.observaciones_primer_contacto || null
        );

        // Cambio automático de estado: Primer contacto (6) → Tratamiento (7)
        if (
          reclamoActual.estado_id === 6 &&
          data.observaciones_primer_contacto
        ) {
          setClauses.push("estado_id = 7");

          // Buscar en la matriz para cambiar el responsable
          if (
            reclamoActual.clasificacion_id &&
            reclamoActual.clase_id &&
            reclamoActual.causa_id
          ) {
            const matriz =
              await MatrizDireccionamientoModel.findByClasificacion(
                reclamoActual.clasificacion_id,
                reclamoActual.clase_id,
                reclamoActual.causa_id
              );

            if (matriz && matriz.responsable_tratamiento_id) {
              setClauses.push("persona_responsable = @personaResponsable");
              request.input(
                "personaResponsable",
                sql.Int,
                matriz.responsable_tratamiento_id
              );
            }
          }
        }
      }

      if (setClauses.length === 0) {
        return await this.getById(id);
      }

      const updateQuery = `UPDATE reclamos SET ${setClauses.join(
        ", "
      )} WHERE id = @id`;
      await request.query(updateQuery);

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al actualizar reclamo: ${err.message}`);
    }
  }

  static async aprobarReclamo(id) {
    try {
      const pool = await poolPromise;
      const reclamoActual = await this.getById(id);

      if (!reclamoActual) {
        throw new Error("Reclamo no encontrado");
      }

      if (reclamoActual.estado_id !== 24) {
        throw new Error(
          "El reclamo debe estar en estado 'Pendiente de revisión' para ser aprobado"
        );
      }

      const fechaCierre = new Date();

      // Recalcular diferencia y cumplimiento usando fecha límite teórica
      let diffDays = null;
      let cumple = null;
      if (reclamoActual.fecha_limite_teorico) {
        const fechaLimite = new Date(reclamoActual.fecha_limite_teorico);
        const diffMs = fechaCierre.getTime() - fechaLimite.getTime();
        diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        cumple = fechaCierre.getTime() <= fechaLimite.getTime();
      }

      await pool
        .request()
        .input("id", sql.Int, id)
        .input("estado_id", sql.Int, 23)
        .input("fecha_cierre_definitiva", sql.DateTime2, fechaCierre)
        .input("diferencia", sql.Int, diffDays)
        .input("cumplimiento", sql.Bit, cumple)
        .query(
          "UPDATE reclamos SET estado_id = @estado_id, fecha_cierre_definitiva = @fecha_cierre_definitiva, diferencia = COALESCE(@diferencia, diferencia), cumplimiento = COALESCE(@cumplimiento, cumplimiento) WHERE id = @id"
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al aprobar reclamo: ${err.message}`);
    }
  }

  static async rechazarReclamo(id, observaciones) {
    try {
      const pool = await poolPromise;
      const reclamoActual = await this.getById(id);

      if (!reclamoActual) {
        throw new Error("Reclamo no encontrado");
      }

      if (reclamoActual.estado_id !== 24) {
        throw new Error(
          "El reclamo debe estar en estado 'Pendiente de revisión' para ser rechazado"
        );
      }

      await pool
        .request()
        .input("id", sql.Int, id)
        .input("estado_id", sql.Int, 7)
        .input("observaciones", sql.NVarChar(sql.MAX), observaciones || null)
        .query(
          "UPDATE reclamos SET estado_id = @estado_id, observaciones = COALESCE(@observaciones, observaciones) WHERE id = @id"
        );

      return await this.getById(id);
    } catch (err) {
      throw new Error(`Error al rechazar reclamo: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .query("UPDATE reclamos SET activo = 0 WHERE id = @id");
      return { message: "Reclamo inactivado correctamente" };
    } catch (err) {
      throw new Error(`Error al eliminar reclamo: ${err.message}`);
    }
  }
}

export default FormulariosModel;
