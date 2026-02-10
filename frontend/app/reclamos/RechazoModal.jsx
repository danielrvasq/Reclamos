"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import "./ObservacionesModal.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function RechazoModal({ reclamo, onClose, onFinish }) {
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!observaciones.trim()) {
      setError("Debe ingresar una observacion para rechazar el reclamo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authFetch(
        `${API_BASE}/reclamos/${reclamo.id}/rechazar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ observaciones: observaciones.trim() }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Error al rechazar reclamo");
      }

      onFinish();
    } catch (err) {
      setError(err.message || "Error al rechazar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content observaciones-modal">
        <div className="modal-header">
          <h3>Rechazar Reclamo</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="observaciones">Observacion</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese la observacion del rechazo..."
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
            {loading ? "Rechazando..." : "Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
}
