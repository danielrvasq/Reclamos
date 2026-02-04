"use client";
import { useState, useEffect } from "react";
import { X, Layers } from "lucide-react";
import "./ClaseForm.css";

function ClaseForm({ clasificaciones, initialData, onClose, onFinish }) {
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [clasificacionId, setClasificacionId] = useState(
    initialData?.clasificacion_id || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed || !clasificacionId) return;
    onFinish?.({
      nombre: trimmed,
      clasificacion_id: parseInt(clasificacionId),
    });
  };

  return (
    <div className="clf-overlay" role="dialog" aria-modal="true">
      <div className="clf-modal" data-clf>
        <div className="clf-header">
          <div className="clf-title">
            <Layers size={18} />
            <span>{initialData ? "Editar clase" : "Nueva clase"}</span>
          </div>
          <button className="clf-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form className="clf-body" onSubmit={handleSubmit}>
          <label className="clf-field">
            <span>Clasificación</span>
            <select
              value={clasificacionId}
              onChange={(e) => setClasificacionId(e.target.value)}
              required
            >
              <option value="">Selecciona una clasificación</option>
              {clasificaciones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="clf-field">
            <span>Nombre de la clase</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Producto defectuoso"
              required
            />
          </label>

          <div className="clf-footer">
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

export default ClaseForm;
