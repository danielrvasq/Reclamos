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

  useEffect(() => {
    if (reclamo) {
      setFormData({
        solucion_final: reclamo.solucion_final || "",
      });
    }
  }, [reclamo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        solucion_final: formData.solucion_final || null,
      };

      const res = await authFetch(`${API_BASE}/reclamos/${reclamo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onFinish?.();
      } else {
        const error = await res.json();
        alert(
          "Error al guardar la solución: " +
            (error.message || "Error desconocido")
        );
      }
    } catch (error) {
      console.error("Error al guardar solución:", error);
      alert("Error al guardar la solución");
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
            <button type="submit" className="btn-primary">
              <CheckCircle size={16} />
              Guardar Solución
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SolucionModal;
