"use client";
import { useState } from "react";
import { X, FileText } from "lucide-react";
import "./CausaForm.css";

function CausaForm({ clases, initialData, onClose, onFinish }) {
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [claseId, setClaseId] = useState(initialData?.clase_id || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed || !claseId) return;
    onFinish?.({
      nombre: trimmed,
      clase_id: parseInt(claseId),
    });
  };

  return (
    <div className="cf-overlay" role="dialog" aria-modal="true">
      <div className="cf-modal" data-cf>
        <div className="cf-header">
          <div className="cf-title">
            <FileText size={18} />
            <span>{initialData ? "Editar causa" : "Nueva causa"}</span>
          </div>
          <button className="cf-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form className="cf-body" onSubmit={handleSubmit}>
          <label className="cf-field">
            <span>Clase</span>
            <select
              value={claseId}
              onChange={(e) => setClaseId(e.target.value)}
              required
            >
              <option value="">Selecciona una clase</option>
              {clases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="cf-field">
            <span>Nombre de la causa</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Defecto de fabricación"
              required
            />
          </label>

          <div className="cf-footer">
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

export default CausaForm;
