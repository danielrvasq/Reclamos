"use client";
import { useState } from "react";
import { X, Tag } from "lucide-react";
import "./ClasificacionForm.css";

function ClasificacionForm({ onClose, onFinish }) {
  const [nombre, setNombre] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) return;
    onFinish?.(trimmed);
  };

  return (
    <div className="clsf-overlay" role="dialog" aria-modal="true">
      <div className="clsf-modal" data-clsf>
        <div className="clsf-header">
          <div className="clsf-title">
            <Tag size={18} />
            <span>Nueva clasificación</span>
          </div>
          <button className="clsf-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form className="clsf-body" onSubmit={handleSubmit}>
          <label className="clsf-field">
            <span>Nombre de la clasificación</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Reclamos de calidad"
              required
            />
          </label>

          <div className="clsf-footer">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClasificacionForm;
