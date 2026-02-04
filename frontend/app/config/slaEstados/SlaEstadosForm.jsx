"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./SlaEstadosForm.css";

function SlaEstadosForm({
  initialData,
  estadosReclamo,
  productos,
  onClose,
  onFinish,
}) {
  const [formData, setFormData] = useState({
    estado_id: "",
    producto_id: "",
    dias_maximos: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        estado_id: initialData.estado_id || "",
        producto_id: initialData.producto_id || "",
        dias_maximos: initialData.dias_maximos || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      estado_id: parseInt(formData.estado_id, 10),
      producto_id: parseInt(formData.producto_id, 10),
      dias_maximos: parseInt(formData.dias_maximos, 10),
    };
    onFinish?.(payload);
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <div className="form-header">
          <h3>{initialData ? "Editar SLA" : "Nuevo SLA"}</h3>
          <button className="close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-grid">
            <label>
              <span>Producto *</span>
              <select
                name="producto_id"
                value={formData.producto_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Estado *</span>
              <select
                name="estado_id"
                value={formData.estado_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                {estadosReclamo.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Días máximos *</span>
              <input
                type="number"
                name="dias_maximos"
                value={formData.dias_maximos}
                onChange={handleChange}
                placeholder="Ej: 5"
                min="1"
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary">
              {initialData ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SlaEstadosForm;
