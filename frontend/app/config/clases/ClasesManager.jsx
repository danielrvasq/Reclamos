"use client";
import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { authFetch } from "../../utils/authFetch";
import ClaseForm from "./ClaseForm";
import "./ClasesManager.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function ClasesManager({ onClose, onRefresh }) {
  const [list, setList] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClaseForm, setShowClaseForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClases();
    fetchClasificaciones();
  }, []);

  const fetchClasificaciones = async () => {
    try {
      const res = await authFetch(`${API_BASE}/clasificaciones-matriz`);
      const json = await res.json();
      if (res.ok) {
        setClasificaciones(json.data || []);
      }
    } catch (err) {
      console.error("Error cargando clasificaciones", err);
    }
  };

  const fetchClases = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/clases-matriz`);
      const json = await res.json();
      if (res.ok) {
        setList(json.data || []);
      }
    } catch (err) {
      setError("Error cargando clases");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      const res = await authFetch(`${API_BASE}/clases-matriz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, activo: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al crear clase");
        return;
      }

      setShowClaseForm(false);
      await fetchClases();
      onRefresh?.();
    } catch (err) {
      setError("Error al crear clase");
    }
  };

  const handleEdit = async (data) => {
    try {
      const res = await authFetch(
        `${API_BASE}/clases-matriz/${editingItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, activo: true }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al actualizar clase");
        return;
      }

      setEditingItem(null);
      await fetchClases();
      onRefresh?.();
    } catch (err) {
      setError("Error al actualizar clase");
    }
  };

  const remove = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/clases-matriz/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al eliminar clase");
        return;
      }

      await fetchClases();
      onRefresh?.();
    } catch (err) {
      setError("Error al eliminar clase");
    }
  };

  const getClasificacionNombre = (clasificacionId) => {
    const clasificacion = clasificaciones.find((c) => c.id === clasificacionId);
    return clasificacion ? clasificacion.nombre : "Sin clasificación";
  };

  return (
    <div className="clm-overlay" role="dialog" aria-modal="true">
      <div className="clm-modal" data-clm>
        <div className="clm-header">
          <div className="clm-title">Gestionar clases matriz</div>
          <button className="clm-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="clm-body">
          {error && <div className="clm-error">{error}</div>}

          <div className="clm-add-button">
            <button
              className="btn primary"
              onClick={() => setShowClaseForm(true)}
            >
              <Plus size={14} />
              <span>Agregar clase</span>
            </button>
          </div>

          <div className="clm-list">
            {loading && <p className="clm-empty">Cargando clases...</p>}
            {!loading && list.length === 0 && (
              <p className="clm-empty">Sin clases creadas</p>
            )}
            {!loading &&
              list.map((item) => (
                <div key={item.id} className="clm-item">
                  <div className="clm-item-content">
                    <span className="clm-name">{item.nombre}</span>
                    <span className="clm-clasificacion">
                      {getClasificacionNombre(item.clasificacion_id)}
                    </span>
                  </div>
                  <div className="clm-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setEditingItem(item)}
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
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

      {showClaseForm && (
        <ClaseForm
          clasificaciones={clasificaciones}
          onClose={() => setShowClaseForm(false)}
          onFinish={handleAdd}
        />
      )}

      {editingItem && (
        <ClaseForm
          clasificaciones={clasificaciones}
          initialData={editingItem}
          onClose={() => setEditingItem(null)}
          onFinish={handleEdit}
        />
      )}
    </div>
  );
}

export default ClasesManager;
