"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import "./ObservacionesModal.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ObservacionesModal({ reclamo, onClose, onFinish }) {
  const [observaciones, setObservaciones] = useState(
    reclamo?.observaciones_primer_contacto || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!observaciones.trim()) {
      setError("Las observaciones no pueden estar vacías");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`${API_BASE}/reclamos/${reclamo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observaciones_primer_contacto: observaciones,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Error al guardar observaciones");
      }

      onFinish();
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content observaciones-modal">
        <div className="modal-header">
          <h3>Observaciones de Primer Contacto</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese las observaciones del primer contacto..."
              rows={6}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
