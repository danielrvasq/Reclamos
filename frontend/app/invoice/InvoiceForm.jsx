"use client";
import { useRef, useState, useEffect } from "react";
import { FiX, FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import "./InvoiceForm.css";
import { authFetch } from "../utils/authFetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function InvoiceForm({
  onClose,
  onFinish,
  reclamoData: initialData,
  isViewOnly = false,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [direction, setDirection] = useState("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = isViewOnly ? 3 : 4; // Si es solo lectura, no mostrar paso de éxito

  // Estados para dropdowns
  const [productos, setProductos] = useState([]);
  const [estadosReclamo, setEstadosReclamo] = useState([]);
  const [matrizDireccionamiento, setMatrizDireccionamiento] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [causas, setCausas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Datos del reclamo
  const [reclamoData, setReclamoData] = useState({
    producto_id: "",
    estado_id: "6",
    asesor: "",
    fecha_creacion: new Date().toISOString().slice(0, 16),
    tiempo_respuesta: "",
    fecha_limite_teorico: "",
    diferencia: "",
    cumplimiento: "",
    proceso_responsable: "",
    persona_responsable: "",
    cliente: "",
    departamento: "",
    ciudad: "",
    nombre_contacto: "",
    cargo: "",
    telefono: "",
    celular: "",
    correo_electronico: "",
    producto: "",
    no_pedido: "",
    no_remision: "",
    fecha_despacho: "",
    via_ingreso: "",
    descripcion_caso: "",
    calificacion: "",
    justificado: false,
    incertidumbre: false,
    no_justificado: false,
    clasificacion_id: "",
    clase_id: "",
    causa_id: "",
    observaciones_primer_contacto: "",
    avance_proceso_responsable: "",
    ccpa: "",
    solucion_final: "",
    dias_habiles_demora: "",
    fecha_cierre_definitiva: "",
  });

  useEffect(() => {
    fetchDropdownData();
    if (initialData) {
      setReclamoData({
        producto_id: initialData.producto_id || "",
        estado_id: initialData.estado_id || "",
        asesor: initialData.asesor || "",
        fecha_creacion: initialData.fecha_creacion
          ? new Date(initialData.fecha_creacion).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        tiempo_respuesta: initialData.tiempo_respuesta || "",
        fecha_limite_teorico: initialData.fecha_limite_teorico
          ? new Date(initialData.fecha_limite_teorico)
              .toISOString()
              .slice(0, 10)
          : "",
        diferencia: initialData.diferencia || "",
        cumplimiento: initialData.cumplimiento || "",
        proceso_responsable: initialData.proceso_responsable || "",
        persona_responsable: initialData.persona_responsable || "",
        cliente: initialData.cliente || "",
        departamento: initialData.departamento || "",
        ciudad: initialData.ciudad || "",
        nombre_contacto: initialData.nombre_contacto || "",
        cargo: initialData.cargo || "",
        telefono: initialData.telefono || "",
        celular: initialData.celular || "",
        correo_electronico: initialData.correo_electronico || "",
        producto: initialData.producto || "",
        no_pedido: initialData.no_pedido || "",
        no_remision: initialData.no_remision || "",
        fecha_despacho: initialData.fecha_despacho
          ? new Date(initialData.fecha_despacho).toISOString().slice(0, 10)
          : "",
        via_ingreso: initialData.via_ingreso || "",
        descripcion_caso: initialData.descripcion_caso || "",
        calificacion: initialData.calificacion || "",
        justificado: initialData.justificado || false,
        incertidumbre: initialData.incertidumbre || false,
        no_justificado: initialData.no_justificado || false,
        clasificacion_id: initialData.clasificacion_id || "",
        clase_id: initialData.clase_id || "",
        causa_id: initialData.causa_id || "",
        observaciones_primer_contacto:
          initialData.observaciones_primer_contacto || "",
        avance_proceso_responsable:
          initialData.avance_proceso_responsable || "",
        ccpa: initialData.ccpa || "",
        solucion_final: initialData.solucion_final || "",
        dias_habiles_demora: initialData.dias_habiles_demora || "",
        fecha_cierre_definitiva: initialData.fecha_cierre_definitiva
          ? new Date(initialData.fecha_cierre_definitiva)
              .toISOString()
              .slice(0, 10)
          : "",
      });
    }
  }, [initialData]);

  const fetchDropdownData = async () => {
    try {
      const [
        prodRes,
        estadosRes,
        matrizRes,
        clasiRes,
        claseRes,
        causaRes,
        areaRes,
        usuarioRes,
      ] = await Promise.all([
        authFetch(`${API_BASE}/productos`),
        authFetch(`${API_BASE}/estados-reclamo`),
        authFetch(`${API_BASE}/matriz-direccionamiento`),
        authFetch(`${API_BASE}/clasificaciones-matriz`),
        authFetch(`${API_BASE}/clases-matriz`),
        authFetch(`${API_BASE}/causas-matriz`),
        authFetch(`${API_BASE}/area`),
        authFetch(`${API_BASE}/usuarios`),
      ]);

      const prodJson = await prodRes.json();
      if (prodRes.ok) setProductos(prodJson.data || []);

      const estadosJson = await estadosRes.json();
      if (estadosRes.ok) setEstadosReclamo(estadosJson.data || []);

      const matrizJson = await matrizRes.json();
      if (matrizRes.ok) setMatrizDireccionamiento(matrizJson.data || []);

      const clasiJson = await clasiRes.json();
      if (clasiRes.ok) setClasificaciones(clasiJson.data || []);

      const claseJson = await claseRes.json();
      if (claseRes.ok) setClases(claseJson.data || []);

      const causaJson = await causaRes.json();
      if (causaRes.ok) setCausas(causaJson.data || []);

      const areaJson = await areaRes.json();
      console.log("Areas response:", areaRes.status, areaJson);
      if (areaRes.ok) setAreas(areaJson.data || []);

      const usuarioJson = await usuarioRes.json();
      if (usuarioRes.ok) setUsuarios(usuarioJson.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const selectedProductId = parseInt(reclamoData.producto_id);

  // Matrices NO se filtran por producto - la matriz es universal
  // Se busca solo por clasificacion/clase/causa
  const matrizDisponible = matrizDireccionamiento;

  // Clasificaciones disponibles (todas las de la matriz)
  const filteredClasificaciones = clasificaciones.filter((clasi) =>
    matrizDisponible.some((m) => m.clasificacion_id === clasi.id)
  );

  // Clases disponibles filtradas por clasificación
  const filteredClases = clases.filter((cl) => {
    const selectedClasificacion = parseInt(reclamoData.clasificacion_id);
    if (!selectedClasificacion) {
      return matrizDisponible.some((m) => m.clase_id === cl.id);
    }
    return matrizDisponible.some(
      (m) =>
        m.clasificacion_id === selectedClasificacion && m.clase_id === cl.id
    );
  });

  // Causas disponibles filtradas por clase (y clasificación)
  const filteredCausas = causas.filter((c) => {
    const selectedClasificacion = parseInt(reclamoData.clasificacion_id);
    const selectedClase = parseInt(reclamoData.clase_id);
    return matrizDisponible.some(
      (m) =>
        (!selectedClasificacion ||
          m.clasificacion_id === selectedClasificacion) &&
        (!selectedClase || m.clase_id === selectedClase) &&
        m.causa_id === c.id
    );
  });

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      if (currentStep === 2) {
        // Último paso antes de enviar
        handleSubmit();
      } else {
        setDirection("forward");
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  const handleFieldChange = (e) => {
    if (isViewOnly) return; // No permitir cambios en modo lectura

    const { name, value } = e.target;

    // Si es calificacion, actualizar también los booleanos correspondientes
    if (name === "calificacion") {
      setReclamoData((prev) => ({
        ...prev,
        [name]: value,
        justificado: value === "justificado",
        incertidumbre: value === "incertidumbre",
        no_justificado: value === "no_justificado",
      }));
      return;
    }

    // Si es fecha_cierre_definitiva y estamos editando, calcular cumplimiento
    if (name === "fecha_cierre_definitiva" && initialData?.id) {
      setReclamoData((prev) => {
        if (prev.fecha_limite_teorico && value) {
          const fechaLimite = new Date(prev.fecha_limite_teorico + "T00:00:00");
          const fechaCierre = new Date(value + "T00:00:00");
          const diferenciaDias = Math.floor(
            (fechaLimite - fechaCierre) / (1000 * 60 * 60 * 24)
          );
          const cumplimiento = diferenciaDias >= 0; // positiva = cumple
          return {
            ...prev,
            [name]: value,
            diferencia: diferenciaDias,
            cumplimiento: cumplimiento,
          };
        }
        return { ...prev, [name]: value };
      });
      return;
    }

    const resetTiempoYFecha = () => {
      setReclamoData((prev) => ({
        ...prev,
        tiempo_respuesta: "",
        fecha_limite_teorico: "",
      }));
    };

    const setDesdeMatriz = (matriz) => {
      if (!matriz) return;
      const diasRespuesta =
        matriz.tiempo_respuesta_dias || matriz.dias_respuesta_maximo || 0;
      const hoy = new Date();
      const fechaLimite = new Date(hoy);
      fechaLimite.setDate(fechaLimite.getDate() + diasRespuesta);
      const fechaLimiteFormato = fechaLimite.toISOString().split("T")[0];

      setReclamoData((prev) => ({
        ...prev,
        tiempo_respuesta: diasRespuesta,
        fecha_limite_teorico: fechaLimiteFormato,
      }));
    };

    if (name === "producto_id") {
      // Al cambiar el producto, reiniciar selección de clasificación, clase y causa
      resetTiempoYFecha();
      setReclamoData((prev) => ({
        ...prev,
        clasificacion_id: "",
        clase_id: "",
        causa_id: "",
      }));
    }

    if (name === "clasificacion_id") {
      // Cambiar clasificación reinicia clase y causa; SLA se calcula cuando haya combinación completa
      resetTiempoYFecha();
      setReclamoData((prev) => ({
        ...prev,
        clase_id: "",
        causa_id: "",
      }));
    }

    if (name === "clase_id") {
      // Cambiar clase reinicia causa; SLA se calcula cuando haya combinación completa
      resetTiempoYFecha();
      setReclamoData((prev) => ({
        ...prev,
        causa_id: "",
      }));
    }

    if (name === "causa_id") {
      // Al seleccionar causa, buscar en la matriz (sin filtrar por producto)
      const clasId = parseInt(reclamoData.clasificacion_id);
      const claseId = parseInt(reclamoData.clase_id);
      const causaId = parseInt(value);
      const matriz = matrizDireccionamiento.find(
        (m) =>
          m.clasificacion_id === clasId &&
          m.clase_id === claseId &&
          m.causa_id === causaId
      );
      if (matriz) {
        setDesdeMatriz(matriz);
      } else {
        resetTiempoYFecha();
      }
    }

    if (name === "proceso_responsable") {
      // Al seleccionar un área, guardar el ID del área y llenar automáticamente el responsable
      const areaId = parseInt(value);
      const area = areas.find((a) => a.id === areaId);
      setReclamoData((prev) => ({
        ...prev,
        [name]: value, // Guardar el ID del área
        persona_responsable:
          area && area.responsable
            ? usuarios.find((u) => u.id === area.responsable)?.nombre || ""
            : "",
      }));
    } else {
      // Cambio normal de campo
      setReclamoData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setReclamoData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    if (isViewOnly || isSubmitting) return; // No permitir envío en modo lectura o doble click
    setIsSubmitting(true);

    try {
      const payload = {
        producto_id: parseInt(reclamoData.producto_id) || null,
        estado_id: parseInt(reclamoData.estado_id) || undefined,
        asesor: reclamoData.asesor || null,
        fecha_creacion: reclamoData.fecha_creacion || null,
        tiempo_respuesta: parseInt(reclamoData.tiempo_respuesta) || null,
        fecha_limite_teorico: reclamoData.fecha_limite_teorico || null,
        diferencia: parseInt(reclamoData.diferencia) || null,
        cumplimiento:
          reclamoData.cumplimiento === "" ? null : !!reclamoData.cumplimiento,
        proceso_responsable: reclamoData.proceso_responsable || null,
        persona_responsable: reclamoData.persona_responsable || null,
        cliente: reclamoData.cliente || null,
        departamento: reclamoData.departamento || null,
        ciudad: reclamoData.ciudad || null,
        nombre_contacto: reclamoData.nombre_contacto || null,
        cargo: reclamoData.cargo || null,
        telefono: reclamoData.telefono || null,
        celular: reclamoData.celular || null,
        correo_electronico: reclamoData.correo_electronico || null,
        producto: reclamoData.producto || null,
        no_pedido: reclamoData.no_pedido || null,
        no_remision: reclamoData.no_remision || null,
        fecha_despacho: reclamoData.fecha_despacho || null,
        via_ingreso: reclamoData.via_ingreso || null,
        descripcion_caso: reclamoData.descripcion_caso || null,
        calificacion: reclamoData.calificacion || null,
        justificado: reclamoData.justificado,
        incertidumbre: reclamoData.incertidumbre,
        no_justificado: reclamoData.no_justificado,
        clasificacion_id: parseInt(reclamoData.clasificacion_id) || null,
        clase_id: parseInt(reclamoData.clase_id) || null,
        causa_id: parseInt(reclamoData.causa_id) || null,
        observaciones_primer_contacto:
          reclamoData.observaciones_primer_contacto || null,
        avance_proceso_responsable:
          reclamoData.avance_proceso_responsable || null,
        ccpa: reclamoData.ccpa || null,
        solucion_final: reclamoData.solucion_final || null,
        dias_habiles_demora: parseInt(reclamoData.dias_habiles_demora) || null,
        fecha_cierre_definitiva: reclamoData.fecha_cierre_definitiva || null,
      };

      let res;
      if (initialData?.id) {
        // Actualizar
        res = await authFetch(`${API_BASE}/reclamos/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Crear
        res = await authFetch(`${API_BASE}/reclamos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setDirection("forward");
        setCurrentStep(3); // Paso de éxito
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el reclamo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`invoice-form-overlay ${isClosing ? "closing" : "opening"}`}
      data-view-only={isViewOnly}
    >
      <div className="invoice-form-container">
        <button className="close-button" onClick={handleClose}>
          <FiX />
        </button>

        <div className="steps-indicator">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="step-wrapper">
              <div
                className={`step-circle ${
                  index === currentStep
                    ? "active"
                    : index < currentStep
                    ? "completed"
                    : ""
                }`}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`step-line ${
                    index < currentStep ? "completed" : ""
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="form-content">
          <div
            key={currentStep}
            className={`step-panel ${
              direction === "forward" ? "slide-in-right" : "slide-in-left"
            }`}
          >
            {/* Paso 0: Datos del reclamo y responsables */}
            {currentStep === 0 && (
              <div className="details-form">
                <h2>
                  {initialData ? "Editar Reclamo" : "Nuevo Reclamo"} - Paso 1
                </h2>
                <p className="step-description">Datos generales del reclamo</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="producto_id">Producto *</label>
                    <select
                      id="producto_id"
                      name="producto_id"
                      value={reclamoData.producto_id}
                      onChange={handleFieldChange}
                      required
                    >
                      <option value="">Seleccione</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  {initialData && (
                    <div className="form-group">
                      <label htmlFor="estado_id">Estado</label>
                      <select
                        id="estado_id"
                        name="estado_id"
                        value={reclamoData.estado_id}
                        onChange={handleFieldChange}
                      >
                        <option value="">Seleccione</option>
                        {estadosReclamo
                          .filter((e) => e.activo)
                          .map((estado) => (
                            <option key={estado.id} value={estado.id}>
                              {estado.nombre}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="asesor">Asesor</label>
                    <input
                      type="text"
                      id="asesor"
                      name="asesor"
                      value={reclamoData.asesor}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="clasificacion_id">Clasificación</label>
                    <select
                      id="clasificacion_id"
                      name="clasificacion_id"
                      value={reclamoData.clasificacion_id}
                      onChange={handleFieldChange}
                      disabled={!reclamoData.producto_id}
                    >
                      <option value="">Seleccione</option>
                      {filteredClasificaciones.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="clase_id">Clase</label>
                    <select
                      id="clase_id"
                      name="clase_id"
                      value={reclamoData.clase_id}
                      onChange={handleFieldChange}
                      disabled={
                        !reclamoData.producto_id ||
                        !reclamoData.clasificacion_id
                      }
                    >
                      <option value="">Seleccione</option>
                      {filteredClases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="causa_id">Causa</label>
                    <select
                      id="causa_id"
                      name="causa_id"
                      value={reclamoData.causa_id}
                      onChange={handleFieldChange}
                      disabled={
                        !reclamoData.producto_id ||
                        !reclamoData.clasificacion_id ||
                        !reclamoData.clase_id
                      }
                    >
                      <option value="">Seleccione</option>
                      {filteredCausas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="fecha_creacion">Fecha de creación</label>
                    <input
                      type="datetime-local"
                      id="fecha_creacion"
                      name="fecha_creacion"
                      value={reclamoData.fecha_creacion}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tiempo_respuesta">
                      Tiempo de respuesta (días)
                    </label>
                    <input
                      type="number"
                      id="tiempo_respuesta"
                      name="tiempo_respuesta"
                      value={reclamoData.tiempo_respuesta}
                      readOnly
                      title="Se carga automáticamente según el producto seleccionado"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fecha_limite_teorico">
                      Fecha límite teórico
                    </label>
                    <input
                      type="date"
                      id="fecha_limite_teorico"
                      name="fecha_limite_teorico"
                      value={reclamoData.fecha_limite_teorico}
                      readOnly
                      title="Se calcula automáticamente como hoy + días de respuesta"
                    />
                  </div>
                  {initialData?.id && (
                    <div className="form-group">
                      <label htmlFor="diferencia">Diferencia</label>
                      <input
                        type="number"
                        id="diferencia"
                        name="diferencia"
                        value={reclamoData.diferencia}
                        onChange={handleFieldChange}
                      />
                    </div>
                  )}
                  {initialData?.id && (
                    <div className="form-group">
                      <label>Cumplimiento</label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "4px",
                            backgroundColor: reclamoData.cumplimiento
                              ? "#d4edda"
                              : "#f8d7da",
                            color: reclamoData.cumplimiento
                              ? "#155724"
                              : "#721c24",
                            fontWeight: "500",
                          }}
                        >
                          {reclamoData.cumplimiento
                            ? "✓ Cumple"
                            : "✗ No cumple"}
                        </span>
                        {reclamoData.diferencia !== undefined &&
                          reclamoData.diferencia !== "" && (
                            <span style={{ color: "#666", fontSize: "0.9em" }}>
                              ({reclamoData.diferencia} días)
                            </span>
                          )}
                      </div>
                      <small
                        style={{
                          color: "#999",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        Se calcula como: fecha límite teórico - fecha cierre
                        definitiva
                      </small>
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="proceso_responsable">
                      Proceso responsable
                    </label>
                    <select
                      id="proceso_responsable"
                      name="proceso_responsable"
                      value={reclamoData.proceso_responsable}
                      onChange={handleFieldChange}
                    >
                      <option value="">Seleccione un área</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="persona_responsable">
                      Persona responsable
                    </label>
                    <input
                      type="text"
                      id="persona_responsable"
                      name="persona_responsable"
                      value={reclamoData.persona_responsable}
                      readOnly
                      title="Se llena automáticamente al seleccionar el área"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="via_ingreso">Vía de ingreso</label>
                    <select
                      id="via_ingreso"
                      name="via_ingreso"
                      value={reclamoData.via_ingreso}
                      onChange={handleFieldChange}
                    >
                      <option value="">Seleccione</option>
                      <option value="Email">Email</option>
                      <option value="Teléfono">Teléfono</option>
                      <option value="Presencial">Presencial</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 1: Datos del cliente y pedido */}
            {currentStep === 1 && (
              <div className="details-form">
                <h2>
                  {initialData ? "Editar Reclamo" : "Nuevo Reclamo"} - Paso 2
                </h2>
                <p className="step-description">Datos del cliente y pedido</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="cliente">Cliente</label>
                    <input
                      type="text"
                      id="cliente"
                      name="cliente"
                      value={reclamoData.cliente}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="departamento">Departamento</label>
                    <input
                      type="text"
                      id="departamento"
                      name="departamento"
                      value={reclamoData.departamento}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ciudad">Ciudad</label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      value={reclamoData.ciudad}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nombre_contacto">Nombre de contacto</label>
                    <input
                      type="text"
                      id="nombre_contacto"
                      name="nombre_contacto"
                      value={reclamoData.nombre_contacto}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cargo">Cargo</label>
                    <input
                      type="text"
                      id="cargo"
                      name="cargo"
                      value={reclamoData.cargo}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      value={reclamoData.telefono}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="celular">Celular</label>
                    <input
                      type="text"
                      id="celular"
                      name="celular"
                      value={reclamoData.celular}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="correo_electronico">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="correo_electronico"
                      name="correo_electronico"
                      value={reclamoData.correo_electronico}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="producto">Producto</label>
                    <input
                      type="text"
                      id="producto"
                      name="producto"
                      value={reclamoData.producto}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="no_pedido">
                      No. pedido (varios separados por coma)
                    </label>
                    <input
                      type="text"
                      id="no_pedido"
                      name="no_pedido"
                      value={reclamoData.no_pedido}
                      onChange={handleFieldChange}
                      placeholder="2784849, 688465"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="no_remision">
                      No. remisión (varios separados por coma)
                    </label>
                    <input
                      type="text"
                      id="no_remision"
                      name="no_remision"
                      value={reclamoData.no_remision}
                      onChange={handleFieldChange}
                      placeholder="331434, 33112"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fecha_despacho">Fecha de despacho</label>
                    <input
                      type="date"
                      id="fecha_despacho"
                      name="fecha_despacho"
                      value={reclamoData.fecha_despacho}
                      onChange={handleFieldChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Detalle del caso y clasificación */}
            {currentStep === 2 && (
              <div className="details-form">
                <h2>
                  {initialData ? "Editar Reclamo" : "Nuevo Reclamo"} - Paso 3
                </h2>
                <p className="step-description">
                  Detalle del caso y clasificación
                </p>
                <div className="form-grid">
                  <div className="form-group full">
                    <label htmlFor="descripcion_caso">
                      Descripción del caso
                    </label>
                    <textarea
                      id="descripcion_caso"
                      name="descripcion_caso"
                      value={reclamoData.descripcion_caso}
                      onChange={handleFieldChange}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="calificacion">Calificación</label>
                    <select
                      id="calificacion"
                      name="calificacion"
                      value={reclamoData.calificacion}
                      onChange={handleFieldChange}
                    >
                      <option value="">Seleccione</option>
                      <option value="incertidumbre">Incertidumbre</option>
                      <option value="justificado">Justificado</option>
                      <option value="no_justificado">No justificado</option>
                    </select>
                  </div>

                  <div className="form-group full">
                    <label htmlFor="observaciones_primer_contacto">
                      Observaciones del primer contacto
                    </label>
                    <textarea
                      id="observaciones_primer_contacto"
                      name="observaciones_primer_contacto"
                      value={reclamoData.observaciones_primer_contacto}
                      onChange={handleFieldChange}
                      rows={3}
                    />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="avance_proceso_responsable">
                      Avance del proceso responsable
                    </label>
                    <textarea
                      id="avance_proceso_responsable"
                      name="avance_proceso_responsable"
                      value={reclamoData.avance_proceso_responsable}
                      onChange={handleFieldChange}
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ccpa">
                      CCPA (varios separados por coma)
                    </label>
                    <input
                      type="text"
                      id="ccpa"
                      name="ccpa"
                      value={reclamoData.ccpa}
                      onChange={handleFieldChange}
                    />
                  </div>

                  {initialData?.id && (
                    <div className="form-group full">
                      <label htmlFor="solucion_final">Solución final</label>
                      <textarea
                        id="solucion_final"
                        name="solucion_final"
                        value={reclamoData.solucion_final}
                        onChange={handleFieldChange}
                        rows={3}
                      />
                    </div>
                  )}

                  {initialData?.id && (
                    <>
                      <div className="form-group">
                        <label htmlFor="dias_habiles_demora">
                          Días hábiles de demora
                        </label>
                        <input
                          type="number"
                          id="dias_habiles_demora"
                          name="dias_habiles_demora"
                          value={reclamoData.dias_habiles_demora}
                          onChange={handleFieldChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="fecha_cierre_definitiva">
                          Fecha de cierre definitiva
                        </label>
                        <input
                          type="date"
                          id="fecha_cierre_definitiva"
                          name="fecha_cierre_definitiva"
                          value={reclamoData.fecha_cierre_definitiva}
                          onChange={handleFieldChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Paso 3: Éxito */}
            {currentStep === 3 && (
              <div className="success-section">
                <div className="success-icon-wrapper">
                  <FiCheckCircle className="success-icon" />
                </div>
                <h2>¡Reclamo guardado exitosamente!</h2>
                <p className="step-description">
                  El reclamo ha sido registrado en el sistema
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            className="action-button secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
          >
            <FiArrowLeft />
            <span>Volver</span>
          </button>
          {currentStep < totalSteps - 1 ? (
            <button
              className="action-button primary"
              onClick={handleNext}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              <span>
                {isSubmitting && currentStep === 2 ? "Guardando..." : "Avanzar"}
              </span>
              <FiArrowRight />
            </button>
          ) : (
            <button
              className="action-button primary"
              onClick={() => {
                if (!isViewOnly && onFinish) onFinish(reclamoData);
                handleClose();
              }}
            >
              <span>Cerrar</span>
              <FiX />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceForm;
