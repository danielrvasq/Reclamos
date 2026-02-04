"use client";
import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { authFetch } from "../../utils/authFetch";
import CausaForm from "./CausaForm";
import "./CausasManager.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function CausasManager({ onClose, onRefresh }) {
  const [list, setList] = useState([]);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCausaForm, setShowCausaForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCausas();
    fetchClases();
  }, []);

  const fetchClases = async () => {
    try {
      const res = await authFetch(`${API_BASE}/clases-matriz`);
      const json = await res.json();
      if (res.ok) {
        setClases(json.data || []);
      }
    } catch (err) {
      console.error("Error cargando clases", err);
    }
  };

  const fetchCausas = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/causas-matriz`);
      const json = await res.json();
      if (res.ok) {
        setList(json.data || []);
      }
    } catch (err) {
      setError("Error cargando causas");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      const res = await authFetch(`${API_BASE}/causas-matriz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, activo: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al crear causa");
        return;
      }

      setShowCausaForm(false);
      await fetchCausas();
      onRefresh?.();
    } catch (err) {
      setError("Error al crear causa");
    }
  };

  const handleEdit = async (data) => {
    try {
      const res = await authFetch(
        `${API_BASE}/causas-matriz/${editingItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, activo: true }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al actualizar causa");
        return;
      }

      setEditingItem(null);
      await fetchCausas();
      onRefresh?.();
    } catch (err) {
      setError("Error al actualizar causa");
    }
  };

  const remove = async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/causas-matriz/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Error al eliminar causa");
        return;
      }

      await fetchCausas();
      onRefresh?.();
    } catch (err) {
      setError("Error al eliminar causa");
    }
  };

  const getClaseNombre = (claseId) => {
    const clase = clases.find((c) => c.id === claseId);
    return clase ? clase.nombre : "Sin clase";
  };

  return (
    <div className="cm-overlay" role="dialog" aria-modal="true">
      <div className="cm-modal" data-cm>
        <div className="cm-header">
          <div className="cm-title">Gestionar causas matriz</div>
          <button className="cm-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="cm-body">
          {error && <div className="cm-error">{error}</div>}

          <div className="cm-add-button">
            <button
              className="btn primary"
              onClick={() => setShowCausaForm(true)}
            >
              <Plus size={14} />
              <span>Agregar causa</span>
            </button>
          </div>

          <div className="cm-list">
            {loading && <p className="cm-empty">Cargando causas...</p>}
            {!loading && list.length === 0 && (
              <p className="cm-empty">Sin causas creadas</p>
            )}
            {!loading &&
              list.map((item) => (
                <div key={item.id} className="cm-item">
                  <div className="cm-item-content">
                    <span className="cm-name">{item.nombre}</span>
                    <span className="cm-clase">
                      {getClaseNombre(item.clase_id)}
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

      {showCausaForm && (
        <CausaForm
          clases={clases}
          onClose={() => setShowCausaForm(false)}
          onFinish={handleAdd}
        />
      )}

      {editingItem && (
        <CausaForm
          clases={clases}
          initialData={editingItem}
          onClose={() => setEditingItem(null)}
          onFinish={handleEdit}
        />
      )}
    </div>
  );
}

export default CausasManager;
