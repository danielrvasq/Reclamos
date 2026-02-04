"use client";
import { useState } from "react";
import { X, FileText } from "lucide-react";
import "./AreaForm.css";

function AreaForm({ usuarios, initialData, onClose, onFinish }) {
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [responsable, setResponsable] = useState(
    initialData?.responsable || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) return;
    onFinish?.({
      nombre: trimmed,
      responsable: responsable ? parseInt(responsable) : null,
    });
  };

  return (
    <div className="cf-overlay" role="dialog" aria-modal="true">
      <div className="cf-modal" data-cf>
        <div className="cf-header">
          <div className="cf-title">
            <FileText size={18} />
            <span>{initialData ? "Editar área" : "Nueva área"}</span>
          </div>
          <button className="cf-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form className="cf-body" onSubmit={handleSubmit}>
          <label className="cf-field">
            <span>Nombre del área</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Logística"
              required
            />
          </label>

          <label className="cf-field">
            <span>Responsable</span>
            <select
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
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

export default AreaForm;
