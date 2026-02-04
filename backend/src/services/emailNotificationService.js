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
    causa_id
  ) {
    try {
      console.log("\n📧 [EMAIL] Obteniendo correo para PRIMER CONTACTO");
      console.log(
        `   Clasificación: ${clasificacion_id}, Clase: ${clase_id}, Causa: ${causa_id}`
      );

      const matriz = await MatrizDireccionamientoModel.findByClasificacion(
        clasificacion_id,
        clase_id,
        causa_id
      );

      if (!matriz || !matriz.primer_contacto_id) {
        console.log("   ⚠️ No se encontró matriz o primer_contacto_id");
        return [];
      }

      const usuario = await UsuariosModel.getUserById(
        matriz.primer_contacto_id
      );
      if (!usuario || !usuario.correo) {
        console.log(`   ⚠️ Usuario ${matriz.primer_contacto_id} sin correo`);
        return [];
      }

      console.log(`   ✅ Correo encontrado: ${usuario.correo}`);
      console.log(`   👤 Usuario: ${usuario.nombre}`);
      console.log(`   📝 Acción: Registrar observaciones de primer contacto`);

      return [
        {
          email: usuario.correo,
          nombre: usuario.nombre,
          rol: "Primer Contacto",
        },
      ];
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
      console.log("\n📧 [EMAIL] Obteniendo correo para TRATAMIENTO");
      console.log(
        `   Clasificación: ${clasificacion_id}, Clase: ${clase_id}, Causa: ${causa_id}`
      );

      const matriz = await MatrizDireccionamientoModel.findByClasificacion(
        clasificacion_id,
        clase_id,
        causa_id
      );

      if (!matriz || !matriz.responsable_tratamiento_id) {
        console.log("   ⚠️ No se encontró matriz o responsable_tratamiento_id");
        return [];
      }

      const usuario = await UsuariosModel.getUserById(
        matriz.responsable_tratamiento_id
      );
      if (!usuario || !usuario.correo) {
        console.log(
          `   ⚠️ Usuario ${matriz.responsable_tratamiento_id} sin correo`
        );
        return [];
      }

      console.log(`   ✅ Correo encontrado: ${usuario.correo}`);
      console.log(`   👤 Usuario: ${usuario.nombre}`);
      console.log(`   📝 Acción: Registrar solución final`);

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
      console.log("\n📧 [EMAIL] Obteniendo correos para LÍDERES (Revisión)");

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
      console.log(`   ✅ ${usuarios.length} líder(es) encontrado(s)`);

      usuarios.forEach((u) => {
        console.log(`      👤 ${u.nombre} (${u.correo})`);
      });

      console.log(`   📝 Acción: Revisar reclamo y aprobar/rechazar`);

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
      console.log("\n📧 [EMAIL] Obteniendo correo del responsable actual");
      console.log(`   Usuario ID: ${persona_responsable_id}`);

      if (!persona_responsable_id) {
        console.log("   ⚠️ No hay responsable actual");
        return [];
      }

      const usuario = await UsuariosModel.getUserById(persona_responsable_id);
      if (!usuario || !usuario.correo) {
        console.log(`   ⚠️ Usuario ${persona_responsable_id} sin correo`);
        return [];
      }

      console.log(`   ✅ Correo encontrado: ${usuario.correo}`);
      console.log(`   👤 Usuario: ${usuario.nombre}`);
      console.log(`   📝 Acción: Notificación de aprobación`);

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
      console.log("\n📧 [EMAIL] Obteniendo correo para RECHAZO");
      console.log(
        `   Clasificación: ${clasificacion_id}, Clase: ${clase_id}, Causa: ${causa_id}`
      );
      console.log(`   Motivo: ${observaciones}`);

      const matriz = await MatrizDireccionamientoModel.findByClasificacion(
        clasificacion_id,
        clase_id,
        causa_id
      );

      if (!matriz || !matriz.responsable_tratamiento_id) {
        console.log("   ⚠️ No se encontró matriz o responsable_tratamiento_id");
        return [];
      }

      const usuario = await UsuariosModel.getUserById(
        matriz.responsable_tratamiento_id
      );
      if (!usuario || !usuario.correo) {
        console.log(
          `   ⚠️ Usuario ${matriz.responsable_tratamiento_id} sin correo`
        );
        return [];
      }

      console.log(`   ✅ Correo encontrado: ${usuario.correo}`);
      console.log(`   👤 Usuario: ${usuario.nombre}`);
      console.log(`   📝 Acción: Revisar observaciones y corregir solución`);

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
    console.log("\n" + "=".repeat(70));
    console.log(`📬 RESUMEN - ${paso}`);
    console.log("=".repeat(70));

    if (detallesReclamo.id) {
      console.log(`Reclamo ID: ${detallesReclamo.id}`);
    }
    if (detallesReclamo.producto) {
      console.log(`Producto: ${detallesReclamo.producto}`);
    }
    if (detallesReclamo.cliente) {
      console.log(`Cliente: ${detallesReclamo.cliente}`);
    }

    console.log("\n📧 Correos a enviar:");

    if (correos.length === 0) {
      console.log("   ❌ No hay correos para enviar");
    } else {
      correos.forEach((c, idx) => {
        console.log(`   ${idx + 1}. ${c.email} (${c.nombre}) - Rol: ${c.rol}`);
      });
    }

    console.log("=".repeat(70) + "\n");
  }

  /**
   * Envía emails de notificación al crear un reclamo
   */
  static async enviarNotificacionCrearReclamo(
    clasificacion_id,
    clase_id,
    causa_id,
    detallesReclamo
  ) {
    try {
      const correos = await this.obtenerCorreosPrimerContacto(
        clasificacion_id,
        clase_id,
        causa_id
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
        console.log(`✅ Email enviado a ${destinatario.email}`);
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
        console.log(`✅ Email enviado a ${destinatario.email}`);
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
        console.log(`✅ Email enviado a ${destinatario.email}`);
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
        console.log(`✅ Email enviado a ${destinatario.email}`);
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
        console.log(`✅ Email enviado a ${destinatario.email}`);
      }
    } catch (err) {
      console.error("❌ Error enviando notificación rechazo:", err.message);
    }
  }
}

export default EmailNotificationService;
