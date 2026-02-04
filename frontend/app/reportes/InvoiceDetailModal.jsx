import React, { useState } from "react";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("es-CO");
  } catch {
    return d ?? "-";
  }
}

function InvoiceDetailModal({ factura, money, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  if (!factura) return null;

  // Compatibilidad con ambos datasets (facturas y reclamos)
  const isReclamo = Boolean(factura.numero_reclamo);
  const numero_entrada =
    factura.numero_entrada ?? factura.numero_documento?.replace("FV-", "ENT-");
  const tipo_documento = isReclamo
    ? "Reclamo"
    : factura.tipo_documento ?? "Factura";
  const titulo = isReclamo
    ? `Reclamo ${factura.numero_reclamo}`
    : `Factura ${factura.numero_documento}`;
  const subtitulo = isReclamo ? factura.cliente : factura.proveedor_factura;

  const subtotal = isReclamo
    ? null
    : factura.valor_sin_iva ??
      Number((Number(factura.valor_total || 0) / 1.19).toFixed(2));
  const iva = isReclamo
    ? null
    : factura.valor_iva ??
      Number((Number(factura.valor_total || 0) - (subtotal || 0)).toFixed(2));

  // Cálculos para alinear con la tabla de Facturas
  const diffInDaysFromToday = (dateStr) => {
    try {
      const today = new Date();
      const date = new Date(dateStr);
      const diffMs = date.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
      return Math.round(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };
  const diasDif = diffInDaysFromToday(factura.fecha_vencimiento);
  const estadoDiferencia = (() => {
    if (diasDif == null) return "-";
    if (diasDif < 0) return "Vencida";
    if (diasDif === 0) return "Vence hoy";
    if (diasDif <= 5) return "Por vencer (<=5 días)";
    return "En término";
  })();
  const condicionPago = (() => {
    if (isReclamo) return null;
    try {
      const d = new Date(factura.fecha_documento);
      const v = new Date(factura.fecha_vencimiento);
      const days = Math.round((v - d) / (1000 * 60 * 60 * 24));
      return days === 0 ? "Contado" : `${days} días`;
    } catch {
      return "-";
    }
  })();

  const handleClose = () => {
    // Dispara animación de salida basada en CSS y cierra al terminar
    setIsClosing(true);
  };

  return (
    <div
      className={`modal-overlay ${isClosing ? "exit" : "enter"}`}
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
      onAnimationEnd={(e) => {
        if (isClosing && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`modal ${isClosing ? "exit" : "enter"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3>{titulo}</h3>
            <p>{subtitulo}</p>
          </div>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="details-grid">
          {!isReclamo && (
            <div className="detail-item">
              <span className="detail-label">Entrada</span>
              <span className="detail-value">{numero_entrada}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Proceso</span>
            <span className="detail-value">{factura.proceso}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tipo Documento</span>
            <span className="detail-value">{tipo_documento}</span>
          </div>
          {!isReclamo ? (
            <div className="detail-item">
              <span className="detail-label">Número Documento</span>
              <span className="detail-value">{factura.numero_documento}</span>
            </div>
          ) : (
            <div className="detail-item">
              <span className="detail-label">Número Reclamo</span>
              <span className="detail-value">{factura.numero_reclamo}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Estado</span>
            <span
              className={`status-badge ${String(factura.estado).toLowerCase()}`}
            >
              {factura.estado}
            </span>
          </div>
          {!isReclamo && (
            <div className="detail-item">
              <span className="detail-label">Fecha Documento</span>
              <span className="detail-value">
                {formatDate(factura.fecha_documento)}
              </span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Fecha Radicación</span>
            <span className="detail-value">
              {formatDate(factura.fecha_radicacion)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fecha Vencimiento</span>
            <span className="detail-value">
              {formatDate(factura.fecha_vencimiento)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fecha Registro en BD</span>
            <span className="detail-value">
              {formatDate(factura.fecha_creacion)}
            </span>
          </div>
          {!isReclamo ? (
            <>
              <div className="detail-item">
                <span className="detail-label">Subtotal</span>
                <span className="detail-value strong">
                  {money?.format ? money.format(subtotal) : subtotal}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">IVA</span>
                <span className="detail-value">
                  {money?.format ? money.format(iva) : iva}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total</span>
                <span className="detail-value strong">
                  {money?.format
                    ? money.format(factura.valor_total)
                    : factura.valor_total}
                </span>
              </div>
            </>
          ) : (
            <div className="detail-item">
              <span className="detail-label">Valor Reclamo</span>
              <span className="detail-value strong">
                {money?.format
                  ? money.format(factura.valor_reclamo)
                  : factura.valor_reclamo}
              </span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Referencia / Descripción</span>
            <span className="detail-value">
              {isReclamo
                ? factura.descripcion ?? "-"
                : factura.referencia_adicional ?? "-"}
            </span>
          </div>

          {/* Cálculos */}
          <div className="detail-item">
            <span className="detail-label">Diferencia en Días</span>
            <span className="detail-value">{diasDif ?? "-"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estado de Diferencia</span>
            <span className="detail-value">{estadoDiferencia}</span>
          </div>
          {!isReclamo && (
            <div className="detail-item">
              <span className="detail-label">Condición de pago</span>
              <span className="detail-value">{condicionPago}</span>
            </div>
          )}

          {/* Trazabilidad */}
          {!isReclamo && (
            <div className="detail-item">
              <span className="detail-label">NIT</span>
              <span className="detail-value">{factura.nit_factura ?? "-"}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Llegó a Radicación</span>
            <span className="detail-value">
              {factura.llego_radicacion
                ? "Sí"
                : factura.llego_radicacion === false
                ? "No"
                : "-"}
            </span>
          </div>
          {!isReclamo && (
            <>
              <div className="detail-item">
                <span className="detail-label">Estado de Entrada</span>
                <span className="detail-value">
                  {factura.estado_entrada ?? "-"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quién Ingresa</span>
                <span className="detail-value">
                  {factura.quien_ingresa ?? "-"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado Contabilización</span>
                {factura.estado_contabilizacion ? (
                  <span
                    className={`status-badge ${
                      factura.estado_contabilizacion === "contabilizada"
                        ? "corriente"
                        : factura.estado_contabilizacion === "rechazada"
                        ? "danger"
                        : ""
                    }`}
                  >
                    {factura.estado_contabilizacion === "pendiente"
                      ? "Pendiente"
                      : factura.estado_contabilizacion === "rechazada"
                      ? "Rechazada"
                      : factura.estado_contabilizacion === "contabilizada"
                      ? "Contabilizada"
                      : factura.estado_contabilizacion}
                  </span>
                ) : (
                  <span className="detail-value">-</span>
                )}
              </div>
              <div className="detail-item">
                <span className="detail-label">N° Doc Causación</span>
                <span className="detail-value">
                  {factura.numero_documento_causacion ?? "-"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Causación</span>
                <span className="detail-value">
                  {formatDate(factura.fecha_causacion)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-close" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetailModal;
