"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import "./ObservacionesModal.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AprobacionModal({ reclamo, onClose, onFinish }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartaError, setCartaError] = useState("");
  const [cartaLoading, setCartaLoading] = useState(false);
  const [cartaDisponible, setCartaDisponible] = useState(false);
  const [cartaPreviewUrl, setCartaPreviewUrl] = useState("");
  const parseJsonSafe = async (res) => {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    const text = await res.text();
    return { message: text || "Respuesta no valida" };
  };

  useEffect(() => {
    const loadCartaPreview = async () => {
      if (!reclamo?.carta_adjunta_path) {
        setCartaDisponible(false);
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
          const json = await parseJsonSafe(res);
          throw new Error(json?.message || "No se pudo cargar la carta");
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/pdf")) {
          throw new Error("La carta no es un PDF valido");
        }

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setCartaPreviewUrl(objectUrl);
        setCartaDisponible(true);
      } catch (err) {
        setCartaError(err.message || "No se pudo cargar la carta");
        setCartaDisponible(false);
        setCartaPreviewUrl("");
      } finally {
        setCartaLoading(false);
      }
    };

    loadCartaPreview();
  }, [reclamo?.id, reclamo?.carta_adjunta_path]);

  useEffect(() => {
    return () => {
      if (cartaPreviewUrl) {
        URL.revokeObjectURL(cartaPreviewUrl);
      }
    };
  }, [cartaPreviewUrl]);

  const handleDownloadCarta = async () => {
    setCartaLoading(true);
    setCartaError("");
    try {
      const res = await authFetch(`${API_BASE}/reclamos/${reclamo.id}`);
      const json = await parseJsonSafe(res);
      if (!res.ok) {
        throw new Error(json?.message || "No se pudo descargar la carta");
      }

      if (!json?.data?.carta_adjunta_path) {
        throw new Error("No hay carta adjunta");
      }

      const fileRes = await authFetch(
        `${API_BASE}/reclamos/${reclamo.id}/carta-descarga`
      );
      if (!fileRes.ok) {
        const fileJson = await parseJsonSafe(fileRes);
        throw new Error(fileJson?.message || "No se pudo descargar la carta");
      }

      const blob = await fileRes.blob();
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

  const handleApprove = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`${API_BASE}/reclamos/${reclamo.id}/aprobar`, {
        method: "POST",
      });
      const json = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(json.message || "No se pudo aprobar el reclamo");
      }

      onFinish(json);
    } catch (err) {
      setError(err.message || "Error al aprobar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content observaciones-modal">
        <div className="modal-header">
          <h3>Vista previa para aprobar</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Primer contacto</label>
            <div className="readonly-value">
              {reclamo?.observaciones_primer_contacto || "Sin observaciones"}
            </div>
          </div>

          <div className="form-group">
            <label>Solucion final</label>
            <div className="readonly-value">
              {reclamo?.solucion_final || "Sin solucion"}
            </div>
          </div>

          <div className="form-group">
            <label>Carta adjunta</label>
            {cartaLoading && (
              <div className="readonly-value">Procesando...</div>
            )}
            {!cartaLoading && cartaError && (
              <div className="error-message">{cartaError}</div>
            )}
            {!cartaLoading && !cartaError && cartaDisponible && (
              <>
                {cartaPreviewUrl && (
                  <iframe
                    className="carta-preview"
                    src={cartaPreviewUrl}
                    title="Vista previa carta"
                  />
                )}
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadCarta}
                >
                  Descargar carta
                </button>
              </>
            )}
            {!cartaLoading && !cartaError && !cartaDisponible && (
              <div className="readonly-value">Sin carta adjunta</div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleApprove} disabled={loading}>
            {loading ? "Aprobando..." : "Aprobar"}
          </button>
        </div>
      </div>
    </div>
  );
}
