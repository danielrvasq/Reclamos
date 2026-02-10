import MatrizDireccionamientoModel from "../models/matrizDireccionamientoModel.js";
import UsuariosModel from "../models/usuariosModel.js";
import { sql, poolPromise } from "../config/server.js";
import emailService from "./emailService.js";

/**
 * Obtiene los correos de usuarios que deben ser notificados en cada paso del flujo
 */
class EmailNotificationService {
  /**
   * PASO 1: Cuando se crea un reclamo
   * Notificar al responsable del primer contacto
   */
  static async obtenerCorreosPrimerContacto(
    clasificacion_id,
    clase_id,
    causa_id,
    persona_responsable_id = null
  ) {
    try {
      const matriz = await MatrizDireccionamientoModel.findByClasificacion(
        clasificacion_id,
        clase_id,
        causa_id
      );

      if (!matriz || !matriz.primer_contacto_ids?.length) {
        return [];
      }

      const primerContactosIds = matriz.primer_contacto_ids
        .map((id) => parseInt(id, 10))
        .filter((id) => Number.isInteger(id));

      const idsFiltrados = persona_responsable_id
        ? primerContactosIds.filter(
            (id) => id === parseInt(persona_responsable_id, 10)
          )
        : primerContactosIds;

      const contactos = [];

      for (const userId of idsFiltrados) {
        const usuario = await UsuariosModel.getUserById(userId);
        if (!usuario || !usuario.correo) {
          continue;
        }

        contactos.push({
          email: usuario.correo,
          nombre: usuario.nombre,
          rol: "Primer Contacto",
        });
      }

      return contactos;
    } catch (err) {
      console.error(
        "❌ Error obteniendo correos primer contacto:",
        err.message
      );
      return [];
    }
  }

  /**
   * PASO 2: Cuando se registra el primer contacto
   * Notificar al responsable de tratamiento
   */
  static async obtenerCorreosTratamiento(clasificacion_id, clase_id, causa_id) {
    try {
      const matriz = await MatrizDireccionamientoModel.findByClasificacion(
        clasificacion_id,
        clase_id,
        causa_id
      );

      if (!matriz || !matriz.responsable_tratamiento_id) {
        return [];
      }

      const usuario = await UsuariosModel.getUserById(
        matriz.responsable_tratamiento_id
      );
      if (!usuario || !usuario.correo) {
        return [];
      }

      return [
        { email: usuario.correo, nombre: usuario.nombre, rol: "Tratamiento" },
      ];
    } catch (err) {
      console.error("❌ Error obteniendo correos tratamiento:", err.message);
      return [];
    }
  }

  /**
   * PASO 3: Cuando se registra la solución final
   * Notificar a todos los líderes de reclamos para revisión
   */
  static async obtenerCorreosLideres() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("rolNombre", sql.NVarChar(100), "lider Reclamos").query(`
          SELECT DISTINCT u.id, u.nombre, u.correo
          FROM usuarios u
          INNER JOIN usuario_roles ur ON u.id = ur.usuario_id
          INNER JOIN roles r ON ur.rol_id = r.id
          WHERE r.nombre = @rolNombre AND u.activo = 1
        `);

      const usuarios = result.recordset;
      return usuarios.map((u) => ({
        email: u.correo,
        nombre: u.nombre,
        rol: "Líder Reclamos",
      }));
    } catch (err) {
      console.error("❌ Error obteniendo correos líderes:", err.message);
      return [];
    }
  }

  /**
   * PASO 4: Cuando se aprueba un reclamo
   * Notificar al responsable actual del reclamo
   */
  static async obtenerCorreoResponsableActual(persona_responsable_id) {
    try {
      if (!persona_responsable_id) {
        return [];
      }

      const usuario = await UsuariosModel.getUserById(persona_responsable_id);
      if (!usuario || !usuario.correo) {
        return [];
      }

      return [
        { email: usuario.correo, nombre: usuario.nombre, rol: "Responsable" },
      ];
    } catch (err) {
      console.error("❌ Error obteniendo correo responsable:", err.message);
      return [];
    }
  }

  /**
   * PASO 5: Cuando se rechaza un reclamo
   * Notificar al responsable de tratamiento
   */
  static async obtenerCorreosRechazo(
    clasificacion_id,
    clase_id,
    causa_id,
    observaciones
  ) {
    try {
      const matriz = await MatrizDireccionamientoModel.findByClasificacion(
        clasificacion_id,
        clase_id,
        causa_id
      );

      if (!matriz || !matriz.responsable_tratamiento_id) {
        return [];
      }

      const usuario = await UsuariosModel.getUserById(
        matriz.responsable_tratamiento_id
      );
      if (!usuario || !usuario.correo) {
        return [];
      }

      return [
        {
          email: usuario.correo,
          nombre: usuario.nombre,
          rol: "Tratamiento (Rechazo)",
        },
      ];
    } catch (err) {
      console.error("❌ Error obteniendo correos rechazo:", err.message);
      return [];
    }
  }

  /**
   * Registra un resumen de correos que se enviarían
   */
  static logResumen(paso, correos, detallesReclamo = {}) {
    void paso;
    void correos;
    void detallesReclamo;
  }

  /**
   * Envía emails de notificación al crear un reclamo
   */
  static async enviarNotificacionCrearReclamo(
    clasificacion_id,
    clase_id,
    causa_id,
    persona_responsable_id,
    detallesReclamo
  ) {
    try {
      const correos = await this.obtenerCorreosPrimerContacto(
        clasificacion_id,
        clase_id,
        causa_id,
        persona_responsable_id
      );

      this.logResumen("CREAR RECLAMO", correos, detallesReclamo);

      if (correos.length === 0) return;

      for (const destinatario of correos) {
        const html = emailService.generarEmailNuevoReclamo(
          detallesReclamo,
          destinatario
        );
        await emailService.sendEmail({
          to: destinatario.email,
          subject: `📋 Nuevo Reclamo Asignado - ID ${detallesReclamo.id}`,
          html,
        });
      }
    } catch (err) {
      console.error(
        "❌ Error enviando notificación crear reclamo:",
        err.message
      );
    }
  }

  /**
   * Envía emails de notificación al registrar primer contacto
   */
  static async enviarNotificacionPrimerContacto(
    clasificacion_id,
    clase_id,
    causa_id,
    detallesReclamo
  ) {
    try {
      const correos = await this.obtenerCorreosTratamiento(
        clasificacion_id,
        clase_id,
        causa_id
      );

      this.logResumen("REGISTRAR PRIMER CONTACTO", correos, detallesReclamo);

      if (correos.length === 0) return;

      for (const destinatario of correos) {
        const html = emailService.generarEmailCambioEstado(
          detallesReclamo,
          destinatario,
          "Tratamiento"
        );
        await emailService.sendEmail({
          to: destinatario.email,
          subject: `📋 Reclamo en Tratamiento - ID ${detallesReclamo.id}`,
          html,
        });
      }
    } catch (err) {
      console.error(
        "❌ Error enviando notificación primer contacto:",
        err.message
      );
    }
  }

  /**
   * Envía emails de notificación al registrar solución final
   */
  static async enviarNotificacionSolucionFinal(detallesReclamo) {
    try {
      const correos = await this.obtenerCorreosLideres();

      this.logResumen("REGISTRAR SOLUCIÓN FINAL", correos, detallesReclamo);

      if (correos.length === 0) return;

      for (const destinatario of correos) {
        const html = emailService.generarEmailCambioEstado(
          detallesReclamo,
          destinatario,
          "Pendiente de Revisión"
        );
        await emailService.sendEmail({
          to: destinatario.email,
          subject: `📋 Reclamo Pendiente de Revisión - ID ${detallesReclamo.id}`,
          html,
        });
      }
    } catch (err) {
      console.error(
        "❌ Error enviando notificación solución final:",
        err.message
      );
    }
  }

  /**
   * Envía emails de notificación al aprobar reclamo
   */
  static async enviarNotificacionAprobacion(
    persona_responsable_id,
    detallesReclamo
  ) {
    try {
      const correos = await this.obtenerCorreoResponsableActual(
        persona_responsable_id
      );

      this.logResumen("APROBAR RECLAMO", correos, detallesReclamo);

      if (correos.length === 0) return;

      for (const destinatario of correos) {
        const html = emailService.generarEmailCambioEstado(
          detallesReclamo,
          destinatario,
          "Cerrado - Aprobado"
        );
        await emailService.sendEmail({
          to: destinatario.email,
          subject: `✅ Reclamo Aprobado y Cerrado - ID ${detallesReclamo.id}`,
          html,
        });
      }
    } catch (err) {
      console.error("❌ Error enviando notificación aprobación:", err.message);
    }
  }

  /**
   * Envía emails de notificación al rechazar reclamo
   */
  static async enviarNotificacionRechazo(
    clasificacion_id,
    clase_id,
    causa_id,
    detallesReclamo,
    observaciones
  ) {
    try {
      const correos = await this.obtenerCorreosRechazo(
        clasificacion_id,
        clase_id,
        causa_id,
        observaciones
      );

      this.logResumen("RECHAZAR RECLAMO", correos, detallesReclamo);

      if (correos.length === 0) return;

      for (const destinatario of correos) {
        const html = emailService.generarEmailRechazo(
          detallesReclamo,
          destinatario,
          observaciones
        );
        await emailService.sendEmail({
          to: destinatario.email,
          subject: `⚠️ Reclamo Rechazado - Requiere Corrección - ID ${detallesReclamo.id}`,
          html,
        });
      }
    } catch (err) {
      console.error("❌ Error enviando notificación rechazo:", err.message);
    }
  }

  /**
   * Envía emails de notificación por reclamos próximos a vencer
   */
  static async enviarNotificacionProximoVencer(detallesReclamo) {
    try {
      const correosTratamiento = await this.obtenerCorreosTratamiento(
        detallesReclamo.clasificacion_id,
        detallesReclamo.clase_id,
        detallesReclamo.causa_id
      );
      const correosLideres = await this.obtenerCorreosLideres();
      const correos = [...correosTratamiento, ...correosLideres].filter(
        (destinatario, index, self) =>
          destinatario?.email &&
          self.findIndex((item) => item.email === destinatario.email) === index
      );

      this.logResumen("PROXIMO A VENCER", correos, detallesReclamo);

      if (correos.length === 0) return;

      const observaciones =
        detallesReclamo.dias_restantes !== null &&
        detallesReclamo.dias_restantes !== undefined
          ? `Tienes un reclamo asignado proximo a vencer. Quedan ${detallesReclamo.dias_restantes} dias para la fecha limite.`
          : "Tienes un reclamo asignado proximo a vencer.";

      for (const destinatario of correos) {
        const html = emailService.generarEmailCambioEstado(
          {
            ...detallesReclamo,
            nombre_cliente: detallesReclamo.cliente || "N/A",
          },
          destinatario,
          "Proximo a vencer",
          observaciones,
          "#f59e0b"
        );
        await emailService.sendEmail({
          to: destinatario.email,
          subject: `⚠️ Reclamo proximo a vencer - ID ${detallesReclamo.id}`,
          html,
        });
      }
    } catch (err) {
      console.error(
        "❌ Error enviando notificación proximo a vencer:",
        err.message
      );
    }
  }

  /**
   * Envía email al cliente con carta adjunta cuando se aprueba un reclamo
   */
  static async enviarNotificacionAprobacionCliente(
    correoCliente,
    detallesReclamo,
    attachmentPath
  ) {
    try {
      if (!correoCliente || !attachmentPath) return;

      const html = emailService.generarEmailAprobacionCliente(detallesReclamo);
      await emailService.sendEmail({
        to: correoCliente,
        subject: `✅ Reclamo Cerrado - ID ${detallesReclamo.id}`,
        html,
        attachments: [
          {
            filename: `carta_reclamo_${detallesReclamo.id}.docx`,
            path: attachmentPath,
          },
        ],
      });
    } catch (err) {
      console.error(
        "❌ Error enviando notificación aprobación cliente:",
        err.message
      );
    }
  }
}

export default EmailNotificationService;
