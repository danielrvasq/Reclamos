"use client";
import { useState } from "react";
import { X, Tag } from "lucide-react";
import "./TypeForm.css";

function TypeForm({ onClose, onFinish }) {
  const [nombre, setNombre] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) return;
    onFinish?.(trimmed);
  };

  return (
    <div className="tf-overlay" role="dialog" aria-modal="true">
      <div className="tf-modal" data-tf>
        <div className="tf-header">
          <div className="tf-title">
            <Tag size={18} />
            <span>Nuevo tipo</span>
          </div>
          <button className="tf-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form className="tf-body" onSubmit={handleSubmit}>
          <label className="tf-field">
            <span>Nombre del tipo</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Cemento UG"
              required
            />
          </label>

          <div className="tf-footer">
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

export default TypeForm;
