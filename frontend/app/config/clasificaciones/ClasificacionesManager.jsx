"use client";
import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2, Check } from "lucide-react";
import { authFetch } from "../../utils/authFetch";
import ClasificacionForm from "./ClasificacionForm";
import "./ClasificacionesManager.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function ClasificacionesManager({ onClose, onRefresh }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClasificacionForm, setShowClasificacionForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClasificaciones();
  }, []);

  const fetchClasificaciones = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/clasificaciones-matriz`);
      const json = await res.json();
      if (res.ok) {
        setList(json.data || []);
      }
    } catch (err) {
      setError("Error cargando clasificaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (nombre) => {
    try {
      const res = await authFetch(`${API_BASE}/clasificaciones-matriz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, activo: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al crear clasificación");
        return;
      }

      setShowClasificacionForm(false);
      await fetchClasificaciones();
      onRefresh?.();
    } catch (err) {
      setError("Error al crear clasificación");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.nombre);
  };

  const saveEdit = async (id) => {
    const value = editValue.trim();
    if (!value) return;

    try {
      const res = await authFetch(`${API_BASE}/clasificaciones-matriz/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: value, activo: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al actualizar clasificación");
        return;
      }

      setEditingId(null);
      setEditValue("");
      await fetchClasificaciones();
      onRefresh?.();
    } catch (err) {
      setError("Error al actualizar clasificación");
    }
  };

  const remove = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/clasificaciones-matriz/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al eliminar clasificación");
        return;
      }

      await fetchClasificaciones();
      onRefresh?.();
    } catch (err) {
      setError("Error al eliminar clasificación");
    }
  };

  return (
    <div className="clsm-overlay" role="dialog" aria-modal="true">
      <div className="clsm-modal" data-clsm>
        <div className="clsm-header">
          <div className="clsm-title">Gestionar clasificaciones matriz</div>
          <button className="clsm-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="clsm-body">
          {error && <div className="clsm-error">{error}</div>}

          <div className="clsm-add-button">
            <button
              className="btn primary"
              onClick={() => setShowClasificacionForm(true)}
            >
              <Plus size={14} />
              <span>Agregar clasificación</span>
            </button>
          </div>

          <div className="clsm-list">
            {loading && (
              <p className="clsm-empty">Cargando clasificaciones...</p>
            )}
            {!loading && list.length === 0 && (
              <p className="clsm-empty">Sin clasificaciones creadas</p>
            )}
            {!loading &&
              list.map((item) => (
                <div key={item.id} className="clsm-item">
                  {editingId === item.id ? (
                    <input
                      className="clsm-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="clsm-name">{item.nombre}</span>
                  )}
                  <div className="clsm-actions">
                    {editingId === item.id ? (
                      <button
                        type="button"
                        className="icon-btn success"
                        onClick={() => saveEdit(item.id)}
                        title="Guardar"
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit(item)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => remove(item.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {showClasificacionForm && (
        <ClasificacionForm
          onClose={() => setShowClasificacionForm(false)}
          onFinish={handleAdd}
        />
      )}
    </div>
  );
}

export default ClasificacionesManager;
