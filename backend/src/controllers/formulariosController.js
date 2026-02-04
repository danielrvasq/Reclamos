import FormulariosModel from "../models/formulariosModel.js";
import MatrizDireccionamientoModel from "../models/matrizDireccionamientoModel.js";
import RegistrosModel from "../models/registrosModel.js";
import EmailNotificationService from "../services/emailNotificationService.js";

class FormulariosController {
  static async registrarAccion({
    formularioId,
    usuarioId,
    accion,
    observacion,
  }) {
    try {
      await RegistrosModel.create({
        formulario_id: formularioId ?? null,
        usuario_id: usuarioId ?? null,
        accion,
        observacion: observacion || null,
        fecha: new Date(),
      });
    } catch (err) {
      console.error("Error registrando auditoría de reclamos:", err.message);
    }
  }

  static async getAll(req, res) {
    try {
      const items = await FormulariosModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await FormulariosModel.getById(id);
      if (!item)
        return res
          .status(404)
          .json({ status: "error", message: "Reclamo no encontrado" });
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const body = req.body;

      // Validar campos requeridos mínimos
      if (!body.producto_id) {
        return res.status(400).json({
          status: "error",
          message: "producto_id es requerido",
        });
      }

      // Buscar en la matriz para obtener responsables si hay clasificacion
      let persona_responsable = body.persona_responsable
        ? parseInt(body.persona_responsable)
        : null;
      let proceso_responsable = body.proceso_responsable
        ? parseInt(body.proceso_responsable)
        : null;

      if (body.clasificacion_id && body.clase_id && body.causa_id) {
        const matriz = await MatrizDireccionamientoModel.findByClasificacion(
          body.clasificacion_id,
          body.clase_id,
          body.causa_id
        );

        if (matriz) {
          // Asignar primer_contacto_id como persona_responsable para estado Primer contacto (6)
          if (matriz.primer_contacto_id) {
            persona_responsable = matriz.primer_contacto_id;
          }
        }
      }

      const newItem = await FormulariosModel.create({
        producto_id: body.producto_id,
        estado_id: body.estado_id || 1,
        asesor: body.asesor || null,
        fecha_creacion: body.fecha_creacion
          ? new Date(body.fecha_creacion)
          : new Date(),
        numero_mes: body.numero_mes || null,
        mes: body.mes || null,
        año: body.año || null,
        tiempo_respuesta: body.tiempo_respuesta || null,
        fecha_limite_teorico: body.fecha_limite_teorico
          ? new Date(body.fecha_limite_teorico + "T00:00:00")
          : null,
        diferencia: body.diferencia || null,
        cumplimiento:
          body.cumplimiento === null || body.cumplimiento === undefined
            ? null
            : body.cumplimiento === true || body.cumplimiento === "true",
        proceso_responsable: proceso_responsable,
        persona_responsable: persona_responsable,
        cliente: body.cliente || null,
        departamento: body.departamento || null,
        ciudad: body.ciudad || null,
        nombre_contacto: body.nombre_contacto || null,
        cargo: body.cargo || null,
        telefono: body.telefono || null,
        celular: body.celular || null,
        correo_electronico: body.correo_electronico || null,
        producto: body.producto || null,
        no_pedido: body.no_pedido || null,
        no_remision: body.no_remision || null,
        fecha_despacho: body.fecha_despacho || null,
        via_ingreso: body.via_ingreso || null,
        descripcion_caso: body.descripcion_caso || null,
        calificacion: body.calificacion || null,
        justificado:
          typeof body.justificado === "boolean" ? body.justificado : null,
        incertidumbre:
          typeof body.incertidumbre === "boolean" ? body.incertidumbre : null,
        no_justificado:
          typeof body.no_justificado === "boolean" ? body.no_justificado : null,
        clasificacion_id: body.clasificacion_id || null,
        clase_id: body.clase_id || null,
        causa_id: body.causa_id || null,
        observaciones_primer_contacto:
          body.observaciones_primer_contacto || null,
        avance_proceso_responsable: body.avance_proceso_responsable || null,
        ccpa: body.ccpa || null,
        solucion_final: body.solucion_final || null,
        dias_habiles_demora: body.dias_habiles_demora || null,
        fecha_cierre_definitiva: body.fecha_cierre_definitiva || null,
        observaciones: body.observaciones || null,
        creado_por: body.creado_por || null,
        created_at: body.created_at ? new Date(body.created_at) : new Date(),
      });

      await FormulariosController.registrarAccion({
        formularioId: newItem?.id,
        usuarioId: req.usuario?.id || null,
        accion: "CREAR_RECLAMO",
        observacion: "Reclamo creado",
      });

      // Enviar notificación de email al primer contacto
      if (body.clasificacion_id && body.clase_id && body.causa_id) {
        await EmailNotificationService.enviarNotificacionCrearReclamo(
          body.clasificacion_id,
          body.clase_id,
          body.causa_id,
          {
            id: newItem?.id,
            producto: body.producto || "N/A",
            cliente: body.cliente || "N/A",
            nombre_cliente: body.cliente || "N/A",
          }
        );
      }

      res.status(201).json({
        status: "success",
        message: "Formulario creado",
        data: newItem,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const body = req.body;

      // Si se envía avance_proceso_responsable, solucion_final u observaciones_primer_contacto
      // pero no producto_id, usar updatePartial para cambio automático de estado
      if (
        (!body.producto_id && body.avance_proceso_responsable !== undefined) ||
        (!body.producto_id && body.solucion_final !== undefined) ||
        (!body.producto_id && body.observaciones_primer_contacto !== undefined)
      ) {
        const exists = await FormulariosModel.getById(id);
        if (!exists)
          return res
            .status(404)
            .json({ status: "error", message: "Formulario no encontrado" });

        const updateData = {};
        if (body.avance_proceso_responsable !== undefined) {
          updateData.avance_proceso_responsable =
            body.avance_proceso_responsable || null;
        }
        if (body.solucion_final !== undefined) {
          updateData.solucion_final = body.solucion_final || null;
        }
        if (body.observaciones_primer_contacto !== undefined) {
          updateData.observaciones_primer_contacto =
            body.observaciones_primer_contacto || null;
        }
        if (body.fecha_cierre_definitiva !== undefined) {
          updateData.fecha_cierre_definitiva =
            body.fecha_cierre_definitiva || null;
        }
        if (body.dias_habiles_demora !== undefined) {
          updateData.dias_habiles_demora = body.dias_habiles_demora || null;
        }

        const updated = await FormulariosModel.updatePartial(id, updateData);

        if (body.observaciones_primer_contacto !== undefined) {
          await FormulariosController.registrarAccion({
            formularioId: id,
            usuarioId: req.usuario?.id || null,
            accion: "PRIMER_CONTACTO",
            observacion:
              body.observaciones_primer_contacto ||
              "Observaciones de primer contacto registradas",
          });

          // Enviar notificación de email al responsable de tratamiento
          const reclamo = await FormulariosModel.getById(id);
          if (
            reclamo &&
            reclamo.clasificacion_id &&
            reclamo.clase_id &&
            reclamo.causa_id
          ) {
            await EmailNotificationService.enviarNotificacionPrimerContacto(
              reclamo.clasificacion_id,
              reclamo.clase_id,
              reclamo.causa_id,
              {
                id: reclamo.id,
                producto: reclamo.producto || "N/A",
                cliente: reclamo.cliente || "N/A",
                nombre_cliente: reclamo.cliente || "N/A",
              }
            );
          }
        }

        if (body.avance_proceso_responsable !== undefined) {
          await FormulariosController.registrarAccion({
            formularioId: id,
            usuarioId: req.usuario?.id || null,
            accion: "TRATAMIENTO",
            observacion:
              body.avance_proceso_responsable || "Avance de tratamiento",
          });
        }

        if (body.solucion_final !== undefined) {
          await FormulariosController.registrarAccion({
            formularioId: id,
            usuarioId: req.usuario?.id || null,
            accion: "TRATAMIENTO",
            observacion: body.solucion_final || "Solución final registrada",
          });

          // Enviar notificación de email a líderes
          const reclamo = await FormulariosModel.getById(id);
          if (reclamo) {
            await EmailNotificationService.enviarNotificacionSolucionFinal({
              id: reclamo.id,
              producto: reclamo.producto || "N/A",
              cliente: reclamo.cliente || "N/A",
              nombre_cliente: reclamo.cliente || "N/A",
            });
          }
        }

        return res.status(200).json({
          status: "success",
          message: "Reclamo actualizado correctamente",
          data: updated,
        });
      }

      // Si no, usar update completo que requiere producto_id
      if (!body.producto_id) {
        return res.status(400).json({
          status: "error",
          message: "producto_id es requerido",
        });
      }

      const exists = await FormulariosModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Formulario no encontrado" });

      const updated = await FormulariosModel.update(id, {
        producto_id: body.producto_id,
        estado_id: body.estado_id || null,
        asesor: body.asesor || null,
        numero_mes: body.numero_mes || null,
        mes: body.mes || null,
        año: body.año || null,
        tiempo_respuesta: body.tiempo_respuesta || null,
        fecha_limite_teorico: body.fecha_limite_teorico
          ? new Date(body.fecha_limite_teorico + "T00:00:00")
          : null,
        diferencia: body.diferencia || null,
        cumplimiento:
          body.cumplimiento === null || body.cumplimiento === undefined
            ? null
            : body.cumplimiento === true || body.cumplimiento === "true",
        proceso_responsable: body.proceso_responsable || null,
        persona_responsable: body.persona_responsable || null,
        cliente: body.cliente || null,
        departamento: body.departamento || null,
        ciudad: body.ciudad || null,
        nombre_contacto: body.nombre_contacto || null,
        cargo: body.cargo || null,
        telefono: body.telefono || null,
        celular: body.celular || null,
        correo_electronico: body.correo_electronico || null,
        producto: body.producto || null,
        no_pedido: body.no_pedido || null,
        no_remision: body.no_remision || null,
        fecha_despacho: body.fecha_despacho || null,
        via_ingreso: body.via_ingreso || null,
        descripcion_caso: body.descripcion_caso || null,
        calificacion: body.calificacion || null,
        justificado:
          typeof body.justificado === "boolean" ? body.justificado : null,
        incertidumbre:
          typeof body.incertidumbre === "boolean" ? body.incertidumbre : null,
        no_justificado:
          typeof body.no_justificado === "boolean" ? body.no_justificado : null,
        clasificacion_id: body.clasificacion_id || null,
        clase_id: body.clase_id || null,
        causa_id: body.causa_id || null,
        observaciones_primer_contacto:
          body.observaciones_primer_contacto || null,
        avance_proceso_responsable: body.avance_proceso_responsable || null,
        ccpa: body.ccpa || null,
        solucion_final: body.solucion_final || null,
        dias_habiles_demora: body.dias_habiles_demora || null,
        fecha_cierre_definitiva: body.fecha_cierre_definitiva || null,
        creado_por: body.creado_por || null,
      });

      res.json({
        status: "success",
        message: "Formulario actualizado",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await FormulariosModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Formulario no encontrado" });

      const result = await FormulariosModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async aprobar(req, res) {
    try {
      const { id } = req.params;
      const reclamo = await FormulariosModel.getById(id);

      const updated = await FormulariosModel.aprobarReclamo(id);

      await FormulariosController.registrarAccion({
        formularioId: id,
        usuarioId: req.usuario?.id || null,
        accion: "APROBACION",
        observacion: "Reclamo aprobado y cerrado",
      });

      // Enviar notificación de email de aprobación
      if (reclamo && reclamo.persona_responsable) {
        await EmailNotificationService.enviarNotificacionAprobacion(
          reclamo.persona_responsable,
          {
            id: reclamo.id,
            producto: reclamo.producto || "N/A",
            cliente: reclamo.cliente || "N/A",
            nombre_cliente: reclamo.cliente || "N/A",
          }
        );
      }

      res.json({
        status: "success",
        message: "Reclamo aprobado y cerrado",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async rechazar(req, res) {
    try {
      const { id } = req.params;
      const { observaciones } = req.body || {};

      if (!observaciones || !observaciones.trim()) {
        return res.status(400).json({
          status: "error",
          message: "La observación es obligatoria para rechazar",
        });
      }

      const reclamo = await FormulariosModel.getById(id);
      const updated = await FormulariosModel.rechazarReclamo(
        id,
        observaciones.trim()
      );

      await FormulariosController.registrarAccion({
        formularioId: id,
        usuarioId: req.usuario?.id || null,
        accion: "RECHAZO",
        observacion:
          observaciones.trim() || "Reclamo rechazado, vuelve a tratamiento",
      });

      // Enviar notificación de email de rechazo
      if (
        reclamo &&
        reclamo.clasificacion_id &&
        reclamo.clase_id &&
        reclamo.causa_id
      ) {
        await EmailNotificationService.enviarNotificacionRechazo(
          reclamo.clasificacion_id,
          reclamo.clase_id,
          reclamo.causa_id,
          {
            id: reclamo.id,
            producto: reclamo.producto || "N/A",
            cliente: reclamo.cliente || "N/A",
            nombre_cliente: reclamo.cliente || "N/A",
          },
          observaciones.trim()
        );
      }

      res.json({
        status: "success",
        message: "Reclamo rechazado, vuelve a tratamiento",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default FormulariosController;
