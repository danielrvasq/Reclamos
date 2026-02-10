"use client";
import { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { authFetch } from "../utils/authFetch";
import "./SolucionModal.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function SolucionModal({ reclamo, onClose, onFinish }) {
  const [formData, setFormData] = useState({
    solucion_final: "",
  });
  const [archivoCarta, setArchivoCarta] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reclamo) {
      setFormData({
        solucion_final: reclamo.solucion_final || "",
      });
      setArchivoCarta(null);
      setError("");
    }
  }, [reclamo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setArchivoCarta(null);
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "docx") {
      setError("Solo se permiten archivos .docx");
      e.target.value = "";
      setArchivoCarta(null);
      return;
    }
    setError("");
    setArchivoCarta(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!archivoCarta) {
      setError("Debe adjuntar la carta en formato .docx");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("solucion_final", formData.solucion_final || "");
      if (archivoCarta) {
        payload.append("carta", archivoCarta);
      }

      const res = await authFetch(
        `${API_BASE}/reclamos/${reclamo.id}/solucion-final`,
        {
          method: "POST",
          body: payload,
        }
      );

      if (res.ok) {
        onFinish?.();
      } else {
        const error = await res.json();
        setError(
          "Error al guardar la solución: " +
            (error.message || "Error desconocido")
        );
      }
    } catch (error) {
      console.error("Error al guardar solución:", error);
      setError("Error al guardar la solución");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) => {
    if (!d) return "N/A";
    const dateStr = d.split("T")[0];
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("es-CO");
  };

  return (
    <div className="solucion-modal-overlay">
      <div className="solucion-modal">
        <div className="solucion-modal-header">
          <div>
            <h3>Dar Solución al Reclamo</h3>
            <p className="solucion-modal-subtitle">
              Reclamo #{reclamo?.id} - {reclamo?.cliente}
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="solucion-modal-body">
          {reclamo?.observaciones && (
            <div className="info-banner">
              <strong>Observación del líder:</strong>
              <div className="info-banner-text">{reclamo.observaciones}</div>
            </div>
          )}
          <div className="form-section">
            <h4>Datos de Solución</h4>
            <div className="form-fields">
              <label>
                <span>Solución Final *</span>
                <textarea
                  name="solucion_final"
                  value={formData.solucion_final}
                  onChange={handleChange}
                  placeholder="Describe la solución aplicada al reclamo..."
                  rows="4"
                  required
                />
              </label>
              <label>
                <span>Carta de respuesta (DOCX) *</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                />
                <small className="file-hint">
                  {archivoCarta ? archivoCarta.name : "Archivo obligatorio"}
                </small>
              </label>
            </div>
            <p className="info-text">
              La fecha de cierre definitiva se asignará automáticamente cuando
              el líder apruebe la solución.
            </p>
          </div>

          <div className="solucion-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <CheckCircle size={16} />
              {loading ? "Guardando..." : "Guardar Solución"}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default SolucionModal;
