"use client";
import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2, Check } from "lucide-react";
import TypeForm from "./TypeForm";
import { authFetch } from "../utils/authFetch";
import "./TypeManager.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function TypeManager({ onClose, onRefresh }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/tipos-producto`);
      const json = await res.json();
      if (res.ok) {
        setList(json.data || []);
      }
    } catch (err) {
      setError("Error cargando tipos");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (nombre) => {
    try {
      const res = await authFetch(`${API_BASE}/tipos-producto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, activo: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al crear tipo");
        return;
      }

      setShowTypeForm(false);
      await fetchTypes();
      onRefresh?.();
    } catch (err) {
      setError("Error al crear tipo");
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
      const res = await authFetch(`${API_BASE}/tipos-producto/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: value, activo: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al actualizar tipo");
        return;
      }

      setEditingId(null);
      setEditValue("");
      await fetchTypes();
      onRefresh?.();
    } catch (err) {
      setError("Error al actualizar tipo");
    }
  };

  const remove = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/tipos-producto/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al eliminar tipo");
        return;
      }

      await fetchTypes();
      onRefresh?.();
    } catch (err) {
      setError("Error al eliminar tipo");
    }
  };

  return (
    <div className="tm-overlay" role="dialog" aria-modal="true">
      <div className="tm-modal" data-tm>
        <div className="tm-header">
          <div className="tm-title">Gestionar tipos</div>
          <button className="tm-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="tm-body">
          {error && <div className="tm-error">{error}</div>}

          <div className="tm-add-button">
            <button
              className="btn primary"
              onClick={() => setShowTypeForm(true)}
            >
              <Plus size={14} />
              <span>Agregar tipo</span>
            </button>
          </div>

          <div className="tm-list">
            {loading && <p className="tm-empty">Cargando tipos...</p>}
            {!loading && list.length === 0 && (
              <p className="tm-empty">Sin tipos creados</p>
            )}
            {!loading &&
              list.map((item) => (
                <div key={item.id} className="tm-item">
                  {editingId === item.id ? (
                    <input
                      className="tm-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="tm-name">{item.nombre}</span>
                  )}
                  <div className="tm-actions">
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

      {showTypeForm && (
        <TypeForm onClose={() => setShowTypeForm(false)} onFinish={handleAdd} />
      )}
    </div>
  );
}

export default TypeManager;
