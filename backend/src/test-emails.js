import EmailNotificationService from "./services/emailNotificationService.js";

/**
 * Script de prueba para verificar logs de correos
 * Prueba cada paso del flujo del reclamo
 */

console.log("\n");
console.log(
  "╔═══════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║             PRUEBA DE LOGS DE NOTIFICACIÓN POR EMAIL              ║"
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
};

// PASO 1: Crear Reclamo
console.log("\n▶️ PASO 1: Crear Reclamo");
console.log("─".repeat(70));
const correosPaso1 =
  await EmailNotificationService.obtenerCorreosPrimerContacto(
    reclamoEjemplo.clasificacion_id,
    reclamoEjemplo.clase_id,
    reclamoEjemplo.causa_id
  );
EmailNotificationService.logResumen("CREAR RECLAMO", correosPaso1, {
  id: reclamoEjemplo.id,
  producto: reclamoEjemplo.producto,
  cliente: reclamoEjemplo.cliente,
});

// PASO 2: Registrar Primer Contacto
console.log("\n▶️ PASO 2: Registrar Observaciones de Primer Contacto");
console.log("─".repeat(70));
const correosPaso2 = await EmailNotificationService.obtenerCorreosTratamiento(
  reclamoEjemplo.clasificacion_id,
  reclamoEjemplo.clase_id,
  reclamoEjemplo.causa_id
);
EmailNotificationService.logResumen("REGISTRAR PRIMER CONTACTO", correosPaso2, {
  id: reclamoEjemplo.id,
  producto: reclamoEjemplo.producto,
  cliente: reclamoEjemplo.cliente,
});

// PASO 3: Registrar Solución Final
console.log("\n▶️ PASO 3: Registrar Solución Final");
console.log("─".repeat(70));
const correosPaso3 = await EmailNotificationService.obtenerCorreosLideres();
EmailNotificationService.logResumen("REGISTRAR SOLUCIÓN FINAL", correosPaso3, {
  id: reclamoEjemplo.id,
  producto: reclamoEjemplo.producto,
  cliente: reclamoEjemplo.cliente,
});

// PASO 4: Aprobar Reclamo
console.log("\n▶️ PASO 4: Aprobar Reclamo");
console.log("─".repeat(70));
const correosPaso4 =
  await EmailNotificationService.obtenerCorreoResponsableActual(1);
EmailNotificationService.logResumen("APROBAR RECLAMO", correosPaso4, {
  id: reclamoEjemplo.id,
  producto: reclamoEjemplo.producto,
  cliente: reclamoEjemplo.cliente,
});

// PASO 5: Rechazar Reclamo
console.log("\n▶️ PASO 5: Rechazar Reclamo");
console.log("─".repeat(70));
const correosPaso5 = await EmailNotificationService.obtenerCorreosRechazo(
  reclamoEjemplo.clasificacion_id,
  reclamoEjemplo.clase_id,
  reclamoEjemplo.causa_id,
  "La solución no es completa, falta validar con el cliente"
);
EmailNotificationService.logResumen("RECHAZAR RECLAMO", correosPaso5, {
  id: reclamoEjemplo.id,
  producto: reclamoEjemplo.producto,
  cliente: reclamoEjemplo.cliente,
});

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
