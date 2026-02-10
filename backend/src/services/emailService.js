import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configuración del transportador de correo usando Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string} options.to - Correo del destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.html - Contenido HTML del correo
 * @param {Array} options.attachments - Adjuntos para el correo
 * @returns {Promise<Object>} - Información del correo enviado
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const mailOptions = {
      from: `Sistema de Reclamos <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error al enviar email a ${to}:`, error.message);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
};

/**
 * Genera el HTML para notificación al cliente con carta adjunta
 */
const generarEmailAprobacionCliente = (reclamo) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Reclamo Cerrado</h2>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>Tu reclamo ha sido cerrado. Adjuntamos la carta de respuesta.</p>
          <div class="detail">
            <span class="label">ID Reclamo:</span> ${reclamo?.id || "N/A"}
          </div>
          <div class="detail">
            <span class="label">Producto:</span> ${reclamo?.producto || "N/A"}
          </div>
          <div class="detail">
            <span class="label">Cliente:</span> ${reclamo?.cliente || "N/A"}
          </div>
          <p style="margin-top: 20px;">Gracias por comunicarte con nosotros.</p>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Genera el HTML para notificación de nuevo reclamo
 */
const generarEmailNuevoReclamo = (reclamo, encargado) => {
  const fechaCreacion = reclamo?.fecha_creacion
    ? new Date(reclamo.fecha_creacion)
    : null;
  const fechaCreacionTexto =
    fechaCreacion && !Number.isNaN(fechaCreacion.getTime())
      ? fechaCreacion.toLocaleDateString("es-ES")
      : "N/A";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
        .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin: 10px 0; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nuevo Reclamo Asignado</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${encargado.nombre}</strong>,</p>
          <p>Se te ha asignado un nuevo reclamo para <strong>Primer Contacto</strong>:</p>
          
          <div class="detail">
            <span class="label">ID Reclamo:</span> ${reclamo.id}
          </div>
          <div class="detail">
            <span class="label">Producto:</span> ${reclamo.producto || "N/A"}
          </div>
          <div class="detail">
            <span class="label">Cliente:</span> ${
              reclamo.nombre_cliente || "N/A"
            }
          </div>
          <div class="detail">
            <span class="label">Fecha de creación:</span> ${
              fechaCreacionTexto
            }
          </div>
          
          <p style="margin-top: 20px;">Por favor, accede al sistema para revisar los detalles y registrar el primer contacto.</p>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Genera el HTML para notificación de cambio de estado
 */
const generarEmailCambioEstado = (
  reclamo,
  encargado,
  estadoNuevo,
  observaciones = null,
  headerColor = "#2196F3"
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${headerColor}; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Reclamo Asignado - ${estadoNuevo}</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${encargado.nombre}</strong>,</p>
          <p>Se te ha asignado un reclamo en estado <strong>${estadoNuevo}</strong>:</p>
          
          <div class="detail">
            <span class="label">ID Reclamo:</span> ${reclamo.id}
          </div>
          <div class="detail">
            <span class="label">Producto:</span> ${reclamo.producto || "N/A"}
          </div>
          <div class="detail">
            <span class="label">Cliente:</span> ${
              reclamo.nombre_cliente || "N/A"
            }
          </div>
          <div class="detail">
            <span class="label">Estado Actual:</span> ${estadoNuevo}
          </div>
          
          ${
            observaciones
              ? `
          <div class="alert">
            <strong>Observaciones:</strong><br>
            ${observaciones}
          </div>
          `
              : ""
          }
          
          <p style="margin-top: 20px;">Por favor, accede al sistema para revisar los detalles y proceder con las acciones necesarias.</p>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Genera el HTML para notificación de rechazo
 */
const generarEmailRechazo = (reclamo, encargado, observaciones) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .alert { background-color: #f8d7da; border-left: 4px solid #f44336; padding: 10px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Reclamo Rechazado</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${encargado.nombre}</strong>,</p>
          <p>El siguiente reclamo ha sido <strong>rechazado</strong> y requiere revisión:</p>
          
          <div class="detail">
            <span class="label">ID Reclamo:</span> ${reclamo.id}
          </div>
          <div class="detail">
            <span class="label">Producto:</span> ${reclamo.producto || "N/A"}
          </div>
          <div class="detail">
            <span class="label">Cliente:</span> ${
              reclamo.nombre_cliente || "N/A"
            }
          </div>
          
          <div class="alert">
            <strong>Motivo del Rechazo:</strong><br>
            ${observaciones}
          </div>
          
          <p style="margin-top: 20px;">Por favor, accede al sistema para revisar las observaciones y realizar las correcciones necesarias.</p>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default {
  sendEmail,
  generarEmailNuevoReclamo,
  generarEmailCambioEstado,
  generarEmailRechazo,
  generarEmailAprobacionCliente,
};
