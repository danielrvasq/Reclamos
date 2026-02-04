"use client";
import { useState } from "react";
import { X, PackagePlus, ChevronDown } from "lucide-react";
import "./ProductForm.css";

function ProductForm({ onClose, onFinish, types = [], editData = null }) {
  const [form, setForm] = useState({
    codigo: editData?.codigo || "",
    nombre: editData?.nombre || "",
    descripcion: editData?.descripcion || "",
    tipo_producto_id:
      editData?.tipo_producto_id || (types.length > 0 ? types[0].id : null),
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onFinish?.(form);
  };

  return (
    <div className="pf-overlay" role="dialog" aria-modal="true">
      <div className="pf-modal" data-pf>
        <div className="pf-header">
          <div className="pf-title">
            <PackagePlus size={18} />
            <span>{editData ? "Editar producto" : "Nuevo producto"}</span>
          </div>
          <button className="pf-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form className="pf-body" onSubmit={handleSubmit}>
          <div className="pf-grid">
            <label className="pf-field">
              <span>Código</span>
              <input
                type="text"
                value={form.codigo}
                onChange={update("codigo")}
                placeholder="Ej: PROD-001"
              />
            </label>

            <label className="pf-field">
              <span>Nombre *</span>
              <input
                type="text"
                value={form.nombre}
                onChange={update("nombre")}
                placeholder="Ej: Cemento UG Gris 50kg"
                required
              />
            </label>

            <label className="pf-field pf-full">
              <span>Descripción</span>
              <textarea
                value={form.descripcion}
                onChange={update("descripcion")}
                placeholder="Descripción del producto"
                rows="3"
              />
            </label>

            <label className="pf-field">
              <span>Tipo de producto</span>
              <div className="select-wrap">
                <select
                  value={form.tipo_producto_id || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      tipo_producto_id: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                  aria-label="Seleccionar tipo de producto"
                >
                  <option value="">Sin tipo</option>
                  {types
                    .filter((t) => t.activo)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                </select>
                <ChevronDown size={16} className="chevron" />
              </div>
            </label>
          </div>

          <div className="pf-footer">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary">
              {editData ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
