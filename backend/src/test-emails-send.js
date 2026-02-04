import EmailNotificationService from "./services/emailNotificationService.js";

/**
 * Script de prueba para verificar envío de emails
 * Prueba cada paso del flujo del reclamo
 */

console.log("\n");
console.log(
  "╔═══════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║             PRUEBA DE ENVÍO DE EMAILS                             ║"
);
console.log(
  "╚═══════════════════════════════════════════════════════════════════╝"
);

// Simulamos un reclamo
const reclamoEjemplo = {
  id: 1,
  producto_id: 1,
  clasificacion_id: 1,
  clase_id: 1,
  causa_id: 1,
  producto: "Producto A",
  cliente: "Cliente XYZ",
  nombre_cliente: "Cliente XYZ",
};

// PASO 1: Crear Reclamo
console.log("\n▶️ PASO 1: Crear Reclamo");
console.log("─".repeat(70));
await EmailNotificationService.enviarNotificacionCrearReclamo(
  reclamoEjemplo.clasificacion_id,
  reclamoEjemplo.clase_id,
  reclamoEjemplo.causa_id,
  reclamoEjemplo
);

// PASO 2: Registrar Primer Contacto
console.log("\n▶️ PASO 2: Registrar Observaciones de Primer Contacto");
console.log("─".repeat(70));
await EmailNotificationService.enviarNotificacionPrimerContacto(
  reclamoEjemplo.clasificacion_id,
  reclamoEjemplo.clase_id,
  reclamoEjemplo.causa_id,
  reclamoEjemplo
);

// PASO 3: Registrar Solución Final
console.log("\n▶️ PASO 3: Registrar Solución Final");
console.log("─".repeat(70));
await EmailNotificationService.enviarNotificacionSolucionFinal(reclamoEjemplo);

// PASO 4: Aprobar Reclamo
console.log("\n▶️ PASO 4: Aprobar Reclamo");
console.log("─".repeat(70));
await EmailNotificationService.enviarNotificacionAprobacion(1, reclamoEjemplo);

// PASO 5: Rechazar Reclamo
console.log("\n▶️ PASO 5: Rechazar Reclamo");
console.log("─".repeat(70));
await EmailNotificationService.enviarNotificacionRechazo(
  reclamoEjemplo.clasificacion_id,
  reclamoEjemplo.clase_id,
  reclamoEjemplo.causa_id,
  reclamoEjemplo,
  "La solución no es completa, falta validar con el cliente"
);

console.log(
  "\n╔═══════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║                    PRUEBA COMPLETADA                              ║"
);
console.log(
  "╚═══════════════════════════════════════════════════════════════════╝\n"
);

process.exit(0);
