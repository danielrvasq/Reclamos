"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import "./ObservacionesModal.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ReclamoDetalleModal({
  reclamo,
  onClose,
  onEdit,
  canEdit,
  helpers,
}) {
  const [cartaLoading, setCartaLoading] = useState(false);
  const [cartaError, setCartaError] = useState("");
  const [cartaPreviewUrl, setCartaPreviewUrl] = useState("");
  if (!reclamo) return null;

  const {
    fmtDate,
    fmtTs,
    getEstadoNombre,
    getAreaNombre,
    getUsuarioNombre,
    getProductoNombre,
    getClasificacionNombre,
    getClaseNombre,
    getCausaNombre,
  } = helpers;

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return value;
  };

  const displayBool = (value) => {
    if (value === true || value === 1) return "Si";
    if (value === false || value === 0) return "No";
    return "—";
  };

  const displayCumplimiento = (value) => {
    if (value === true || value === 1) return "Cumple";
    if (value === false || value === 0) return "No cumple";
    return "—";
  };

  const handleDownloadCarta = async () => {
    setCartaLoading(true);
    setCartaError("");
    try {
      const res = await authFetch(
        `${API_BASE}/reclamos/${reclamo.id}/carta-descarga`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo descargar la carta");
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `carta_reclamo_${reclamo.id}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setCartaError(err.message || "No se pudo descargar la carta");
    } finally {
      setCartaLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCartaPreview = async () => {
      if (!reclamo?.carta_adjunta_path) {
        setCartaPreviewUrl("");
        return;
      }

      setCartaLoading(true);
      setCartaError("");
      try {
        const res = await authFetch(
          `${API_BASE}/reclamos/${reclamo.id}/carta-preview`
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "No se pudo cargar la carta");
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/pdf")) {
          throw new Error("La carta no es un PDF valido");
        }

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setCartaPreviewUrl(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err) {
        if (isMounted) {
          setCartaError(err.message || "No se pudo cargar la carta");
          setCartaPreviewUrl("");
        }
      } finally {
        if (isMounted) {
          setCartaLoading(false);
        }
      }
    };

    loadCartaPreview();

    return () => {
      isMounted = false;
    };
  }, [reclamo?.id, reclamo?.carta_adjunta_path]);

  useEffect(() => {
    return () => {
      if (cartaPreviewUrl) {
        URL.revokeObjectURL(cartaPreviewUrl);
      }
    };
  }, [cartaPreviewUrl]);

  const sections = [
    {
      title: "General",
      fields: [
        { label: "ID", value: reclamo.id },
        { label: "Estado", value: getEstadoNombre(reclamo.estado_id) },
        {
          label: "Producto",
          value: reclamo.producto || getProductoNombre(reclamo.producto_id),
        },
        { label: "Producto ID", value: reclamo.producto_id },
        { label: "Cliente", value: reclamo.cliente },
        { label: "Asesor", value: reclamo.asesor },
        { label: "Proceso responsable", value: getAreaNombre(reclamo.proceso_responsable) },
        { label: "Responsable", value: getUsuarioNombre(reclamo.persona_responsable) },
        { label: "Fecha creacion", value: reclamo.fecha_creacion ? fmtDate(reclamo.fecha_creacion) : "—" },
        {
          label: "Fecha limite",
          value: reclamo.fecha_limite_teorico
            ? fmtDate(reclamo.fecha_limite_teorico)
            : "—",
        },
        {
          label: "Fecha cierre",
          value: reclamo.fecha_cierre_definitiva
            ? fmtDate(reclamo.fecha_cierre_definitiva)
            : "—",
        },
      ],
    },
    {
      title: "Contacto",
      fields: [
        { label: "Nombre contacto", value: reclamo.nombre_contacto },
        { label: "Cargo", value: reclamo.cargo },
        { label: "Telefono", value: reclamo.telefono },
        { label: "Celular", value: reclamo.celular },
        { label: "Correo", value: reclamo.correo_electronico },
        { label: "Departamento", value: reclamo.departamento },
        { label: "Ciudad", value: reclamo.ciudad },
      ],
    },
    {
      title: "Clasificacion",
      fields: [
        { label: "Clasificacion", value: getClasificacionNombre(reclamo.clasificacion_id) },
        { label: "Clase", value: getClaseNombre(reclamo.clase_id) },
        { label: "Causa", value: getCausaNombre(reclamo.causa_id) },
        { label: "Calificacion", value: reclamo.calificacion },
        { label: "Cumplimiento", value: displayCumplimiento(reclamo.cumplimiento) },
        { label: "Justificado", value: displayBool(reclamo.justificado) },
        { label: "Incertidumbre", value: displayBool(reclamo.incertidumbre) },
        { label: "No justificado", value: displayBool(reclamo.no_justificado) },
      ],
    },
    {
      title: "Operacion",
      fields: [
        { label: "Numero pedido", value: reclamo.no_pedido },
        { label: "Numero remision", value: reclamo.no_remision },
        {
          label: "Fecha despacho",
          value: reclamo.fecha_despacho ? fmtDate(reclamo.fecha_despacho) : "—",
        },
        { label: "Via ingreso", value: reclamo.via_ingreso },
        { label: "Tiempo respuesta", value: reclamo.tiempo_respuesta },
        { label: "Diferencia", value: reclamo.diferencia },
        { label: "Dias habiles demora", value: reclamo.dias_habiles_demora },
      ],
    },
    {
      title: "Seguimiento",
      fields: [
        { label: "Descripcion", value: reclamo.descripcion_caso },
        { label: "Observaciones primer contacto", value: reclamo.observaciones_primer_contacto },
        { label: "Avance proceso responsable", value: reclamo.avance_proceso_responsable },
        { label: "CCPA", value: reclamo.ccpa },
        { label: "Solucion final", value: reclamo.solucion_final },
        { label: "Observaciones", value: reclamo.observaciones },
      ],
    },
    {
      title: "Sistema",
      fields: [
        { label: "Creado por", value: reclamo.creado_por },
        { label: "Activo", value: displayBool(reclamo.activo) },
        { label: "Creado en", value: reclamo.created_at ? fmtTs(reclamo.created_at) : "—" },
        { label: "Carta adjunta", value: reclamo.carta_adjunta_path ? "Adjunta" : "No" },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content observaciones-modal reclamo-detalle-modal">
        <div className="modal-header">
          <h3>Detalle del reclamo</h3>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body reclamo-detalle-body">
          {sections.map((section) => (
            <div key={section.title} className="reclamo-detalle-section">
              <h4>{section.title}</h4>
              <div className="reclamo-detalle-grid">
                {section.fields.map((field) => (
                  <div key={field.label} className="reclamo-detalle-item">
                    <span className="reclamo-detalle-label">{field.label}</span>
                    <span className="reclamo-detalle-value">
                      {displayValue(field.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="reclamo-detalle-section">
            <h4>Archivo</h4>
            {cartaError && <div className="error-message">{cartaError}</div>}
            {reclamo.carta_adjunta_path ? (
              <>
                {cartaLoading && (
                  <div className="reclamo-detalle-value">Cargando preview...</div>
                )}
                {!cartaLoading && cartaPreviewUrl && (
                  <iframe
                    className="carta-preview"
                    src={cartaPreviewUrl}
                    title="Vista previa carta"
                  />
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownloadCarta}
                  disabled={cartaLoading}
                >
                  {cartaLoading ? "Descargando..." : "Descargar carta"}
                </button>
              </>
            ) : (
              <div className="reclamo-detalle-value">Sin carta adjunta</div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {canEdit && (
            <button className="btn btn-primary" onClick={onEdit}>
              Editar
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
