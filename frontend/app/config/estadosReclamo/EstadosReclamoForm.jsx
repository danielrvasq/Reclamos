"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./EstadosReclamoForm.css";

function EstadosReclamoForm({ initialData, onClose, onFinish }) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    es_final: false,
    color: 1,
    activo: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        codigo: initialData.codigo || "",
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        es_final: initialData.es_final || false,
        color: initialData.color || 1,
        activo: initialData.activo !== undefined ? initialData.activo : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      codigo: formData.codigo || null,
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      es_final: !!formData.es_final,
      color: parseInt(formData.color) || 1,
      activo: !!formData.activo,
    };
    onFinish?.(payload);
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <div className="form-header">
          <h3>{initialData ? "Editar estado" : "Nuevo estado"}</h3>
          <button className="close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-grid">
            <label>
              <span>Código</span>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Ej: EST001"
              />
            </label>

            <label>
              <span>Nombre *</span>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: En revisión"
                required
              />
            </label>

            <label>
              <span>Color del badge *</span>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
              >
                <option value="1">Azul (Info)</option>
                <option value="2">Amarillo (Advertencia)</option>
                <option value="3">Verde (Éxito)</option>
                <option value="4">Rojo (Peligro)</option>
                <option value="5">Gris (Neutral)</option>
              </select>
            </label>

            <label className="full-width">
              <span>Descripción</span>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe el estado del reclamo"
                rows="3"
              />
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                name="es_final"
                checked={formData.es_final}
                onChange={handleCheckbox}
              />
              <span>Es estado final</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleCheckbox}
              />
              <span>Activo</span>
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

export default EstadosReclamoForm;
