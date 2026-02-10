"use client";
import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { authFetch } from "../../utils/authFetch";
import AreaForm from "./AreaForm";
import "./AreasManager.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function AreasManager({ onClose, onRefresh }) {
  const [list, setList] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAreas();
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await authFetch(`${API_BASE}/usuarios`);
      const json = await res.json();
      if (res.ok) {
        setUsuarios(json.data || []);
      }
    } catch (err) {
      console.error("Error cargando usuarios", err);
    }
  };

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/area`);
      const json = await res.json();
      if (res.ok) {
        setList(json.data || []);
      }
    } catch (err) {
      setError("Error cargando áreas");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      const res = await authFetch(`${API_BASE}/area`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al crear área");
        return;
      }

      setShowAreaForm(false);
      await fetchAreas();
      onRefresh?.();
    } catch (err) {
      setError("Error al crear área");
    }
  };

  const handleEdit = async (data) => {
    try {
      const res = await authFetch(`${API_BASE}/area/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al actualizar área");
        return;
      }

      setEditingItem(null);
      await fetchAreas();
      onRefresh?.();
    } catch (err) {
      setError("Error al actualizar área");
    }
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar esta área?")) return;
    try {
      const res = await authFetch(`${API_BASE}/area/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al eliminar área");
        return;
      }

      await fetchAreas();
      onRefresh?.();
    } catch (err) {
      setError("Error al eliminar área");
    }
  };

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find((u) => u.id === usuarioId);
    return usuario ? usuario.nombre : "Sin asignar";
  };

  return (
    <div className="cm-overlay" role="dialog" aria-modal="true">
      <div className="cm-modal" data-cm>
        <div className="cm-header">
          <div className="cm-title">Gestionar áreas</div>
          <button className="cm-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="cm-body">
          {error && <div className="cm-error">{error}</div>}

          <div className="cm-add-button">
            <button
              className="btn primary"
              onClick={() => setShowAreaForm(true)}
            >
              <Plus size={14} />
              <span>Agregar área</span>
            </button>
          </div>

          <div className="cm-list">
            {loading && <p className="cm-empty">Cargando áreas...</p>}
            {!loading && list.length === 0 && (
              <p className="cm-empty">Sin áreas creadas</p>
            )}
            {!loading &&
              list.map((item) => (
                <div key={item.id} className="cm-item">
                  <div className="cm-item-content">
                    <span className="cm-name">{item.nombre}</span>
                    <span className="cm-responsable">
                      Responsable: {getUsuarioNombre(item.responsable)}
                    </span>
                  </div>
                  <div className="cm-actions">
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

      {showAreaForm && (
        <AreaForm
          usuarios={usuarios}
          onClose={() => setShowAreaForm(false)}
          onFinish={handleAdd}
        />
      )}

      {editingItem && (
        <AreaForm
          usuarios={usuarios}
          initialData={editingItem}
          onClose={() => setEditingItem(null)}
          onFinish={handleEdit}
        />
      )}
    </div>
  );
}

export default AreasManager;
