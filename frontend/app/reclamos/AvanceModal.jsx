"use client";
import { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import "./AvanceModal.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function AvanceModal({ reclamo, onClose, onFinish }) {
  const [formData, setFormData] = useState({
    avance_proceso_responsable: "",
  });

  useEffect(() => {
    if (reclamo) {
      setFormData({
        avance_proceso_responsable: reclamo.avance_proceso_responsable || "",
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
        avance_proceso_responsable: formData.avance_proceso_responsable || null,
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
          "Error al guardar el avance: " +
            (error.message || "Error desconocido")
        );
      }
    } catch (error) {
      console.error("Error al guardar avance:", error);
      alert("Error al guardar el avance");
    }
  };

  return (
    <div className="avance-modal-overlay">
      <div className="avance-modal">
        <div className="avance-modal-header">
          <div>
            <h3>Registrar Avance del Proceso Responsable</h3>
            <p className="avance-modal-subtitle">
              Reclamo #{reclamo?.id} - {reclamo?.cliente}
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="avance-modal-body">
          <div className="form-section">
            <h4>Avance del Proceso</h4>
            <div className="form-fields">
              <label>
                <span>Descripción del Avance *</span>
                <textarea
                  name="avance_proceso_responsable"
                  value={formData.avance_proceso_responsable}
                  onChange={handleChange}
                  placeholder="Describe el avance o actualización del proceso responsable..."
                  rows="6"
                  required
                />
              </label>
            </div>
          </div>

          <div className="avance-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <FileText size={16} />
              Guardar Avance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AvanceModal;
