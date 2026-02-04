"use client";
import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { authFetch } from "../../utils/authFetch";
import SlaEstadosForm from "./SlaEstadosForm";
import "./SlaEstadosManager.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function SlaEstadosManager({ onClose, onRefresh }) {
  const [slaEstados, setSlaEstados] = useState([]);
  const [estadosReclamo, setEstadosReclamo] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slaRes, estadosRes, productosRes] = await Promise.all([
        authFetch(`${API_BASE}/sla-estados`),
        authFetch(`${API_BASE}/estados-reclamo`),
        authFetch(`${API_BASE}/productos`),
      ]);

      const slaJson = await slaRes.json();
      if (slaRes.ok) setSlaEstados(slaJson.data || []);

      const estadosJson = await estadosRes.json();
      if (estadosRes.ok) setEstadosReclamo(estadosJson.data || []);

      const productosJson = await productosRes.json();
      if (productosRes.ok) setProductos(productosJson.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoNombre = (estadoId) => {
    const estado = estadosReclamo.find((e) => e.id === estadoId);
    return estado?.nombre || "N/A";
  };

  const getProductoNombre = (productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    return producto?.nombre || "N/A";
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
        const res = await authFetch(
          `${API_BASE}/sla-estados/${editingItem.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (res.ok) {
          await fetchData();
          setShowForm(false);
          setEditingItem(null);
        }
      } else {
        const res = await authFetch(`${API_BASE}/sla-estados`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchData();
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRemove = async (id) => {
    if (confirm("¿Está seguro de que desea eliminar este SLA?")) {
      try {
        const res = await authFetch(`${API_BASE}/sla-estados/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          await fetchData();
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
          <h3>Gestionar SLA por Estado</h3>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="manager-body">
          {loading ? (
            <p className="loading-text">Cargando SLA estados…</p>
          ) : slaEstados.length === 0 ? (
            <p className="empty-text">No hay SLA configurados.</p>
          ) : (
            <div className="manager-list">
              {slaEstados.map((item) => (
                <div key={item.id} className="manager-item">
                  <div className="item-info">
                    <div className="item-main">
                      <span className="item-name">
                        {getProductoNombre(item.producto_id)} →{" "}
                        {getEstadoNombre(item.estado_id)}
                      </span>
                    </div>
                    <div className="item-meta">
                      <span className="meta-badge">
                        {item.dias_maximos} días
                      </span>
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
              ))}
            </div>
          )}
        </div>

        <div className="manager-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cerrar
          </button>
          <button className="primary-btn" onClick={handleAdd}>
            <FiPlus size={16} />
            <span>Nuevo SLA</span>
          </button>
        </div>
      </div>

      {showForm && (
        <SlaEstadosForm
          initialData={editingItem}
          estadosReclamo={estadosReclamo}
          productos={productos}
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

export default SlaEstadosManager;
