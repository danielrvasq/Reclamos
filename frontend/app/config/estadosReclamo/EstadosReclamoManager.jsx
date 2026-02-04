"use client";
import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { authFetch } from "../../utils/authFetch";
import EstadosReclamoForm from "./EstadosReclamoForm";
import "./EstadosReclamoManager.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function EstadosReclamoManager({ onClose, onRefresh }) {
  const [estadosReclamo, setEstadosReclamo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchEstadosReclamo();
  }, []);

  const fetchEstadosReclamo = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/estados-reclamo`);
      const json = await res.json();
      if (res.ok) setEstadosReclamo(json.data || []);
    } catch (error) {
      console.error("Error fetching estados reclamo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFinish = async (formData) => {
    try {
      if (editingItem?.id) {
        // PUT - actualizar
        const res = await authFetch(
          `${API_BASE}/estados-reclamo/${editingItem.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (res.ok) {
          await fetchEstadosReclamo();
          setShowForm(false);
          setEditingItem(null);
        }
      } else {
        // POST - crear
        const res = await authFetch(`${API_BASE}/estados-reclamo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchEstadosReclamo();
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRemove = async (id) => {
    if (confirm("¿Está seguro de que desea eliminar este estado?")) {
      try {
        const res = await authFetch(`${API_BASE}/estados-reclamo/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          await fetchEstadosReclamo();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="manager-overlay">
      <div className="manager-modal">
        <div className="manager-header">
          <h3>Gestionar Estados de Reclamo</h3>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="manager-body">
          {loading ? (
            <p className="loading-text">Cargando estados reclamo…</p>
          ) : estadosReclamo.length === 0 ? (
            <p className="empty-text">No hay estados registrados.</p>
          ) : (
            <div className="manager-list">
              {estadosReclamo.map((item) => {
                const colorMap = {
                  1: "badge-info",
                  2: "badge-warning",
                  3: "badge-success",
                  4: "badge-danger",
                  5: "badge-muted",
                };
                const badgeClass = colorMap[item.color] || "badge-info";

                return (
                  <div key={item.id} className="manager-item">
                    <div className="item-info">
                      <div className="item-main">
                        <span className="item-name">{item.nombre}</span>
                        {item.codigo && (
                          <span className="item-code">{item.codigo}</span>
                        )}
                        <span
                          className={`badge ${badgeClass}`}
                          style={{ marginLeft: "8px" }}
                        >
                          Preview
                        </span>
                      </div>
                      {item.descripcion && (
                        <p className="item-description">{item.descripcion}</p>
                      )}
                      <div className="item-meta">
                        {item.es_final && (
                          <span className="meta-badge final">Es Final</span>
                        )}
                        {!item.activo && (
                          <span className="meta-badge inactive">Inactivo</span>
                        )}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleRemove(item.id)}
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="manager-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cerrar
          </button>
          <button className="primary-btn" onClick={handleAdd}>
            <FiPlus size={16} />
            <span>Nuevo estado</span>
          </button>
        </div>
      </div>

      {showForm && (
        <EstadosReclamoForm
          initialData={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}

export default EstadosReclamoManager;
