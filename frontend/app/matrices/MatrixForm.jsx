"use client";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import "./MatrixForm.css";
import { authFetch } from "../utils/authFetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function MatrixForm({
  initialData,
  onClose,
  onFinish,
  clasificaciones: clasificacionesProp = [],
  clases: clasesProp = [],
  causas: causasProp = [],
}) {
  const [formData, setFormData] = useState({
    clasificacion_id: "",
    clase_id: "",
    causa_id: "",
    primer_contacto_ids: [],
    tiempo_atencion_inicial_dias: "",
    responsable_tratamiento_id: "",
    tiempo_respuesta_dias: "",
    tipo_respuesta: "",
    activo: true,
  });

  const [clasificaciones, setClasificaciones] = useState(clasificacionesProp);
  const [clases, setClases] = useState(clasesProp);
  const [causas, setCausas] = useState(causasProp);
  const [usuarios, setUsuarios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [primerContactoSeleccionado, setPrimerContactoSeleccionado] =
    useState("");

  useEffect(() => {
    fetchUsers();
    fetchAreas();
  }, []);

  useEffect(() => {
    if (initialData) {
      const primerContactos = Array.isArray(initialData.primer_contacto_ids)
        ? initialData.primer_contacto_ids
        : initialData.primer_contacto_id
        ? [initialData.primer_contacto_id]
        : [];

      setFormData({
        clasificacion_id: initialData.clasificacion_id || "",
        clase_id: initialData.clase_id || "",
        causa_id: initialData.causa_id || "",
        primer_contacto_ids: primerContactos.map(String),
        tiempo_atencion_inicial_dias:
          initialData.tiempo_atencion_inicial_dias || "",
        responsable_tratamiento_id:
          initialData.responsable_tratamiento_id || "",
        tiempo_respuesta_dias: initialData.tiempo_respuesta_dias || "",
        tipo_respuesta: initialData.tipo_respuesta || "",
        activo: initialData.activo !== undefined ? initialData.activo : true,
      });
      setPrimerContactoSeleccionado("");
    }
  }, [initialData]);

  const fetchUsers = async () => {
    try {
      const res = await authFetch(`${API_BASE}/usuarios`);
      const json = await res.json();
      if (res.ok) setUsuarios(json.data || []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await authFetch(`${API_BASE}/area`);
      const json = await res.json();
      if (res.ok) setAreas(json.data || []);
    } catch (error) {
      console.error("Error cargando áreas:", error);
    }
  };

  const areaReclamosId = useMemo(() => {
    const area = areas.find((a) => a.nombre?.toLowerCase() === "reclamos");
    return area?.id || null;
  }, [areas]);

  const usuariosReclamos = useMemo(() => {
    if (!areaReclamosId) return [];
    return usuarios.filter((u) => u.area === areaReclamosId);
  }, [usuarios, areaReclamosId]);

  const filteredClases = useMemo(() => {
    const id = parseInt(formData.clasificacion_id);
    if (!id) return clases;
    return clases.filter((c) => c.clasificacion_id === id);
  }, [clases, formData.clasificacion_id]);

  const filteredCausas = useMemo(() => {
    const id = parseInt(formData.clase_id);
    if (!id) return causas;
    return causas.filter((c) => c.clase_id === id);
  }, [causas, formData.clase_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregarPrimerContacto = () => {
    if (!primerContactoSeleccionado) return;
    setFormData((prev) => {
      if (prev.primer_contacto_ids.includes(primerContactoSeleccionado)) {
        return prev;
      }
      return {
        ...prev,
        primer_contacto_ids: [
          ...prev.primer_contacto_ids,
          primerContactoSeleccionado,
        ],
      };
    });
    setPrimerContactoSeleccionado("");
  };

  const handleQuitarPrimerContacto = (id) => {
    setFormData((prev) => ({
      ...prev,
      primer_contacto_ids: prev.primer_contacto_ids.filter(
        (item) => item !== id
      ),
    }));
  };

  // Mantener sincronía de campos derivados
  useEffect(() => {
    // Si cambia clasificación, limpiar clase y causa
    // (ya se hace en onChange, pero este efecto asegura consistencia cuando initialData cambia)
    setFormData((prev) => ({
      ...prev,
      clase_id:
        prev.clasificacion_id !== formData.clasificacion_id
          ? ""
          : prev.clase_id,
      causa_id: prev.clase_id !== formData.clase_id ? "" : prev.causa_id,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.clasificacion_id, formData.clase_id]);

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const toIntOrNull = (val) => {
    const n = parseInt(val, 10);
    return Number.isNaN(n) ? null : n;
  };

  const toIntArray = (values) => {
    if (!Array.isArray(values)) return [];
    return values
      .map((v) => parseInt(v, 10))
      .filter((v) => Number.isInteger(v));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      clasificacion_id: toIntOrNull(formData.clasificacion_id),
      clase_id: toIntOrNull(formData.clase_id),
      causa_id: toIntOrNull(formData.causa_id),
      primer_contacto_ids: toIntArray(formData.primer_contacto_ids),
      tiempo_atencion_inicial_dias: toIntOrNull(
        formData.tiempo_atencion_inicial_dias
      ),
      responsable_tratamiento_id: toIntOrNull(
        formData.responsable_tratamiento_id
      ),
      tiempo_respuesta_dias: toIntOrNull(formData.tiempo_respuesta_dias),
      tipo_respuesta: formData.tipo_respuesta || null,
      activo: !!formData.activo,
    };

    onFinish?.(payload);
  };

  return (
    <div className="matrix-form-overlay">
      <div className="matrix-form-modal">
        <div className="matrix-form-header">
          <div>
            <p className="matrix-form-subtitle">
              {initialData
                ? "Editar combinación de matriz"
                : "Crear nueva combinación"}
            </p>
            <h3>Matriz Direccionamiento Universal</h3>
          </div>
          <button className="close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="matrix-form-body">
          <div className="matrix-form-grid">
            <label>
              <span>Clasificación *</span>
              <select
                name="clasificacion_id"
                value={formData.clasificacion_id}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    clase_id: "",
                    causa_id: "",
                  }));
                }}
                required
              >
                <option value="">Seleccione</option>
                {clasificaciones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Clase *</span>
              <select
                name="clase_id"
                value={formData.clase_id}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({ ...prev, causa_id: "" }));
                }}
                required
              >
                <option value="">Seleccione</option>
                {filteredClases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Causa *</span>
              <select
                name="causa_id"
                value={formData.causa_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                {filteredCausas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Responsable primer contacto</span>
              <div className="primer-contacto-picker">
                <select
                  name="primer_contacto_select"
                  value={primerContactoSeleccionado}
                  onChange={(e) =>
                    setPrimerContactoSeleccionado(e.target.value)
                  }
                >
                  <option value="">Seleccione</option>
                  {usuariosReclamos.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-btn"
                  onClick={handleAgregarPrimerContacto}
                  disabled={!primerContactoSeleccionado}
                >
                  Añadir
                </button>
              </div>

              {formData.primer_contacto_ids.length === 0 ? (
                <span className="muted">Sin responsables agregados</span>
              ) : (
                <ul className="selected-list">
                  {formData.primer_contacto_ids.map((id) => (
                    <li key={id}>
                      <span>
                        {usuariosReclamos.find((u) => String(u.id) === id)
                          ?.nombre || `ID: ${id}`}
                      </span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleQuitarPrimerContacto(id)}
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </label>

            <label>
              <span>Tiempo atención inicial (días)</span>
              <input
                type="number"
                name="tiempo_atencion_inicial_dias"
                value={formData.tiempo_atencion_inicial_dias}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              <span>Responsable tratamiento</span>
              <select
                name="responsable_tratamiento_id"
                value={formData.responsable_tratamiento_id}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Tiempo respuesta (días)</span>
              <input
                type="number"
                name="tiempo_respuesta_dias"
                value={formData.tiempo_respuesta_dias}
                onChange={handleChange}
                min="0"
              />
            </label>

            <label>
              <span>Tipo de respuesta</span>
              <input
                type="text"
                name="tipo_respuesta"
                value={formData.tipo_respuesta}
                onChange={handleChange}
                placeholder="Ej: Email, Llamada"
              />
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

          <div className="matrix-form-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary">
              {initialData ? "Actualizar matriz" : "Guardar matriz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MatrixForm;
