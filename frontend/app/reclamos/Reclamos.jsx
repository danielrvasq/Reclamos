"use client";
import { useMemo, useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Plus,
  ChevronDown,
  RefreshCw,
  CheckCircle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import Select from "react-select";
import InvoiceForm from "../invoice/InvoiceForm";
import SolucionModal from "./SolucionModal";
import AvanceModal from "./AvanceModal";
import ObservacionesModal from "./ObservacionesModal";
import Toast from "../common/Toast";
import { authFetch } from "../utils/authFetch";
import {
  canEditReclaimos,
  isColaborador,
  isReadOnlyRole,
  isLiderReclamos,
  canApproveReclaims,
} from "../utils/rolePermissions";
import "./Reclamos.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function Reclamos() {
  const [reclamos, setReclamos] = useState([]);
  const [estadosReclamo, setEstadosReclamo] = useState([]);
  const [areas, setAreas] = useState([]);
  const [matrices, setMatrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [usuarioArea, setUsuarioArea] = useState(null);
  const [usuarioRol, setUsuarioRol] = useState(null);

  // Estados para edición
  const [editingReclamo, setEditingReclamo] = useState(null);

  // Estados para modal de solución
  const [showSolucionModal, setShowSolucionModal] = useState(false);
  const [reclamoSolucion, setReclamoSolucion] = useState(null);

  // Estados para modal de avance
  const [showAvanceModal, setShowAvanceModal] = useState(false);
  const [reclamoAvance, setReclamoAvance] = useState(null);

  // Estados para modal de observaciones primer contacto
  const [showObservacionesModal, setShowObservacionesModal] = useState(false);
  const [reclamoObservaciones, setReclamoObservaciones] = useState(null);

  // Filtros
  const [filtro, setFiltro] = useState({
    cliente: "",
  });

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const usuarioJson = localStorage.getItem("usuario");
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        setUsuarioId(usuario.id);
        setUsuarioArea(usuario.area);
        setUsuarioRol(usuario.rol_nombre || usuario.rol);
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    }

    fetchReclamos();
    fetchEstadosReclamo();
    fetchAreas();
    fetchMatrices();
  }, []);

  const fetchReclamos = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/reclamos`);
      const json = await res.json();
      if (res.ok) {
        const data = json.data || [];
        setReclamos(data);
      }
    } catch (error) {
      console.error("Error al cargar reclamos:", error);
      setToastMessage("Error al cargar reclamos");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadosReclamo = async () => {
    try {
      const res = await authFetch(`${API_BASE}/estados-reclamo`);
      const json = await res.json();
      if (res.ok) {
        setEstadosReclamo(json.data || []);
      }
    } catch (error) {
      console.error("Error al cargar estados:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await authFetch(`${API_BASE}/area`);
      const json = await res.json();
      if (res.ok) {
        setAreas(json.data || []);
      }
    } catch (error) {
      console.error("Error al cargar áreas:", error);
    }
  };

  const fetchMatrices = async () => {
    try {
      const res = await authFetch(`${API_BASE}/matriz-direccionamiento`);
      const json = await res.json();
      if (res.ok) {
        setMatrices(json.data || []);
      }
    } catch (error) {
      console.error("Error al cargar matriz:", error);
    }
  };

  const obtenerMatrizParaReclamo = (reclamo) => {
    if (!reclamo) return null;
    return matrices.find(
      (m) =>
        m.clasificacion_id === reclamo.clasificacion_id &&
        m.clase_id === reclamo.clase_id &&
        m.causa_id === reclamo.causa_id
    );
  };

  const esUsuarioPrimerContacto = (reclamo) => {
    if (!usuarioId) return false;
    const matriz = obtenerMatrizParaReclamo(reclamo);
    const ids =
      matriz?.primer_contacto_ids ||
      (matriz?.primer_contacto_id ? [matriz.primer_contacto_id] : []);
    const userId = parseInt(usuarioId, 10);
    return ids.map((id) => parseInt(id, 10)).includes(userId);
  };

  // Separar reclamos por estado (basado en estado_id o lógica de negocio)
  // Mostrar todos los reclamos en una sola lista
  // Filtrar por área del usuario si es colaborador
  const todosReclamos = useMemo(() => {
    if (isColaborador(usuarioRol) && usuarioArea) {
      // Colaborador solo ve reclamos de su área
      // Comparar por ID (numérico)
      const filtrados = reclamos.filter((r) => {
        const procesoId = parseInt(r.proceso_responsable, 10);
        const usuarioId = parseInt(usuarioArea, 10);
        return procesoId === usuarioId;
      });
      return filtrados;
    }
    return reclamos;
  }, [reclamos, usuarioRol, usuarioArea]);

  // Filtrar "mis reclamos" para usuarios con rol "reclamos" que sean responsables
  // Solo muestra reclamos en Primer contacto (6), Tratamiento (7) o Pendiente de revisión (24)
  const misReclamos = useMemo(() => {
    if (usuarioRol === "reclamos" && usuarioId) {
      const userId = parseInt(usuarioId, 10);
      const mis = reclamos.filter((r) => {
        const personaResp = parseInt(r.persona_responsable, 10);
        // Solo mostrar si es responsable Y está en primer contacto (6), tratamiento (7) o revisión (24)
        const esPrimerContacto =
          r.estado_id === 6 && esUsuarioPrimerContacto(r);
        return (
          (personaResp === userId || esPrimerContacto) &&
          (r.estado_id === 6 || r.estado_id === 7 || r.estado_id === 24)
        );
      });
      return mis;
    }
    return [];
  }, [reclamos, usuarioRol, usuarioId, matrices]);

  // Filtrar reclamos en revisión (estado 24) para rol "lider_reclamos"
  const reclamosEnRevision = useMemo(() => {
    if (isLiderReclamos(usuarioRol)) {
      return reclamos.filter((r) => r.estado_id === 24);
    }
    return [];
  }, [reclamos, usuarioRol]);

  const money = useMemo(
    () =>
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }),
    []
  );

  const fmtDate = (d) => {
    if (!d) return "N/A";
    // Si la fecha viene como string ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
    // extraer solo la parte de fecha para evitar problemas de timezone
    let dateStr = d;
    if (typeof d === "string") {
      dateStr = d.split("T")[0]; // Extrae YYYY-MM-DD
      // Crear Date desde la cadena de fecha con zona horaria local
      const [year, month, day] = dateStr.split("-");
      return new Date(year, month - 1, day).toLocaleDateString("es-CO");
    }
    return new Date(d).toLocaleDateString("es-CO");
  };
  const fmtTs = (d) => new Date(d).toLocaleString("es-CO");

  const getEstadoNombre = (estadoId) => {
    const estado = estadosReclamo.find((e) => e.id === estadoId);
    return estado ? estado.nombre : "Sin estado";
  };

  const getEstadoBadgeClass = (estadoId) => {
    const estado = estadosReclamo.find((e) => e.id === estadoId);
    if (!estado || !estado.color) return "badge-muted";
    // Mapeo de valores numéricos de color a clases de badge
    const colorMap = {
      1: "badge-info", // Azul
      2: "badge-warning", // Amarillo
      3: "badge-success", // Verde
      4: "badge-danger", // Rojo
      5: "badge-muted", // Gris
    };
    return colorMap[estado.color] || "badge-info";
  };

  const getAreaNombre = (areaId) => {
    const area = areas.find((a) => a.id === parseInt(areaId));
    return area ? area.nombre : "N/A";
  };

  const isResponsibleForArea = (areaId) => {
    const area = areas.find((a) => a.id === parseInt(areaId, 10));
    return area && area.responsable === usuarioId;
  };

  const handleViewDetail = (row) => {
    setEditingReclamo(row);
    setIsViewOnly(true);
    setShowInvoiceForm(true);
  };

  const handleEdit = (row) => {
    if (isReadOnlyRole(usuarioRol)) {
      setToastMessage("No tienes permisos para editar reclamos");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      return;
    }
    setEditingReclamo(row);
    setIsViewOnly(false);
    setShowInvoiceForm(true);
  };

  const handleOpenInvoiceForm = () => {
    if (isReadOnlyRole(usuarioRol)) {
      setToastMessage("No tienes permisos para crear reclamos");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      return;
    }
    setEditingReclamo(null);
    setIsViewOnly(false);
    setShowInvoiceForm(true);
  };

  const handleAprobar = async (row) => {
    if (!confirm("¿Está seguro de que desea aprobar y cerrar este reclamo?"))
      return;
    try {
      const res = await authFetch(`${API_BASE}/reclamos/${row.id}/aprobar`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        await fetchReclamos();
        setToastMessage("Reclamo aprobado y cerrado correctamente");
      } else {
        setToastMessage(json.message || "No se pudo aprobar el reclamo");
      }
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } catch (error) {
      console.error("Error al aprobar:", error);
      setToastMessage("Error al aprobar reclamo");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  const handleRechazar = async (row) => {
    const observacion = prompt(
      "Ingrese la observación del rechazo (requerida):",
      ""
    );
    if (!observacion || !observacion.trim()) {
      alert("Debe ingresar una observación para rechazar el reclamo.");
      return;
    }
    if (
      !confirm(
        "¿Está seguro de que desea rechazar este reclamo? Volverá a estado de tratamiento."
      )
    )
      return;
    try {
      const res = await authFetch(`${API_BASE}/reclamos/${row.id}/rechazar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observaciones: observacion.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        await fetchReclamos();
        setToastMessage("Reclamo rechazado, vuelve a tratamiento");
      } else {
        setToastMessage(json.message || "No se pudo rechazar el reclamo");
      }
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } catch (error) {
      console.error("Error al rechazar:", error);
      setToastMessage("Error al rechazar reclamo");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  const handleCloseInvoiceForm = () => {
    setShowInvoiceForm(false);
    setEditingReclamo(null);
    setIsViewOnly(false);
    fetchReclamos();
  };
  const handleFinishInvoice = () => {
    setShowInvoiceForm(false);
    setEditingReclamo(null);
    fetchReclamos();
    setToastMessage(
      editingReclamo ? "Reclamo actualizado" : "Nuevo reclamo creado"
    );
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleOpenSolucion = (reclamo) => {
    if (!reclamo) return;
    const userId = parseInt(usuarioId, 10);
    const personaResp = parseInt(reclamo.persona_responsable, 10);
    const puedeRegistrar =
      canApproveReclaims(usuarioRol) || personaResp === userId;

    if (!puedeRegistrar) {
      setToastMessage(
        "No tienes permisos para registrar la solución de este reclamo"
      );
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      return;
    }

    setReclamoSolucion(reclamo);
    setShowSolucionModal(true);
  };

  const handleCloseSolucion = () => {
    setShowSolucionModal(false);
    setReclamoSolucion(null);
  };

  const handleFinishSolucion = () => {
    setShowSolucionModal(false);
    setReclamoSolucion(null);
    fetchReclamos();
    setToastMessage("Solución guardada correctamente");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleOpenAvance = (reclamo) => {
    setReclamoAvance(reclamo);
    setShowAvanceModal(true);
  };

  const handleCloseAvance = () => {
    setShowAvanceModal(false);
    setReclamoAvance(null);
  };

  const handleFinishAvance = () => {
    setShowAvanceModal(false);
    setReclamoAvance(null);
    fetchReclamos();
    setToastMessage("Avance registrado correctamente");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleOpenObservaciones = (reclamo) => {
    setReclamoObservaciones(reclamo);
    setShowObservacionesModal(true);
  };

  const handleDeleteReclamo = async (reclamo) => {
    if (!reclamo?.id) return;
    if (!confirm("¿Está seguro de que desea eliminar este reclamo?")) return;

    try {
      const res = await authFetch(`${API_BASE}/reclamos/${reclamo.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) {
        setToastMessage(json.message || "Error al eliminar reclamo");
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
        return;
      }

      await fetchReclamos();
      setToastMessage("Reclamo eliminado correctamente");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } catch (error) {
      console.error("Error al eliminar reclamo:", error);
      setToastMessage("Error al eliminar reclamo");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  const handleCloseObservaciones = () => {
    setShowObservacionesModal(false);
    setReclamoObservaciones(null);
  };

  const handleFinishObservaciones = () => {
    setShowObservacionesModal(false);
    setReclamoObservaciones(null);
    fetchReclamos();
    setToastMessage("Observaciones de primer contacto registradas");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const TableSection = ({ title, data: rows }) => (
    <div className="reclamos-table-section">
      <div className="reclamos-section-header">
        <h3>{title}</h3>
      </div>

      <>
        <div className="reclamos-table-wrap">
          <table className="reclamos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Descripción</th>
                <th>Asesor</th>
                <th>Proceso Responsable</th>
                <th>
                  <span className="th">
                    <Calendar size={14} className="th-icon" />
                    <span>Fecha Creación</span>
                  </span>
                </th>
                <th>
                  <span className="th">
                    <Calendar size={14} className="th-icon" />
                    <span>Fecha Límite</span>
                  </span>
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((row) => {
                  const clienteMatch = (row.cliente || "")
                    .toLowerCase()
                    .includes(filtro.cliente.toLowerCase());
                  return clienteMatch;
                })
                .map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleViewDetail(row)}
                    className="clickable-row"
                  >
                    <td>{row.id}</td>
                    <td>
                      <span
                        className={`badge ${getEstadoBadgeClass(
                          row.estado_id
                        )}`}
                      >
                        {getEstadoNombre(row.estado_id)}
                      </span>
                    </td>
                    <td>{row.producto || "N/A"}</td>
                    <td>{row.cliente || "N/A"}</td>
                    <td>{row.descripcion_caso || "Sin descripción"}</td>
                    <td>{row.asesor || "N/A"}</td>
                    <td>{getAreaNombre(row.proceso_responsable)}</td>
                    <td>
                      {row.fecha_creacion ? fmtDate(row.fecha_creacion) : "N/A"}
                    </td>
                    <td>
                      {row.fecha_limite_teorico
                        ? fmtDate(row.fecha_limite_teorico)
                        : "N/A"}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        {(!isReadOnlyRole(usuarioRol) ||
                          (isColaborador(usuarioRol) &&
                            isResponsibleForArea(row.proceso_responsable))) &&
                          row.estado_id !== 6 && (
                            <button
                              className="action-btn avance-btn"
                              onClick={() => handleOpenAvance(row)}
                              title="Registrar avance"
                            >
                              <FileText size={16} />
                            </button>
                          )}
                        {(usuarioRol === "reclamos" ||
                          usuarioRol === "administrador") &&
                          row.estado_id === 6 &&
                          (parseInt(row.persona_responsable, 10) ===
                            parseInt(usuarioId, 10) ||
                            esUsuarioPrimerContacto(row)) && (
                            <button
                              className="action-btn observaciones-btn"
                              onClick={() => handleOpenObservaciones(row)}
                              title="Registrar observaciones primer contacto"
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}
                        {!isReadOnlyRole(usuarioRol) && (
                          <>
                            {row.estado_id !== 6 &&
                              row.estado_id !== 23 &&
                              (canApproveReclaims(usuarioRol) ||
                                parseInt(row.persona_responsable, 10) ===
                                  parseInt(usuarioId, 10)) && (
                                <button
                                  className="action-btn solution-btn"
                                  onClick={() => handleOpenSolucion(row)}
                                  title="Dar solución"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(row)}
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                          </>
                        )}
                        {canApproveReclaims(usuarioRol) &&
                          row.estado_id === 24 && (
                            <>
                              <button
                                className="action-btn approve-btn"
                                onClick={() => handleAprobar(row)}
                                title="Aprobar y cerrar"
                              >
                                <ThumbsUp size={16} />
                              </button>
                              <button
                                className="action-btn reject-btn"
                                onClick={() => handleRechazar(row)}
                                title="Rechazar"
                              >
                                <ThumbsDown size={16} />
                              </button>
                            </>
                          )}
                        {canApproveReclaims(usuarioRol) && (
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteReclamo(row)}
                            title="Eliminar reclamo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>
    </div>
  );

  return (
    <div className="reclamos-page">
      <div className="reclamos-header">
        <h2>Reclamos</h2>

        <div className="reclamos-actions">
          <button className="action primary" onClick={fetchReclamos}>
            <RefreshCw size={16} />
            <span>Actualizar</span>
          </button>

          {!isReadOnlyRole(usuarioRol) && (
            <button className="action primary" onClick={handleOpenInvoiceForm}>
              <Plus size={16} />
              <span>Nuevo reclamo</span>
            </button>
          )}
        </div>
      </div>

      <div className="reclamos-filters" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="filter-input"
          value={filtro.cliente}
          onChange={(e) =>
            setFiltro((f) => ({ ...f, cliente: e.target.value }))
          }
        />
      </div>

      {usuarioRol === "reclamos" && misReclamos.length > 0 && (
        <TableSection title="Mis Reclamos" data={misReclamos} />
      )}

      {isLiderReclamos(usuarioRol) && reclamosEnRevision.length > 0 && (
        <TableSection title="Reclamos en Revisión" data={reclamosEnRevision} />
      )}
      <TableSection title="Todos los Reclamos" data={todosReclamos} />

      {showInvoiceForm && (
        <InvoiceForm
          onClose={handleCloseInvoiceForm}
          onFinish={handleFinishInvoice}
          reclamoData={editingReclamo}
          isViewOnly={isViewOnly}
        />
      )}

      {showSolucionModal && (
        <SolucionModal
          reclamo={reclamoSolucion}
          onClose={handleCloseSolucion}
          onFinish={handleFinishSolucion}
        />
      )}

      {showAvanceModal && (
        <AvanceModal
          reclamo={reclamoAvance}
          onClose={handleCloseAvance}
          onFinish={handleFinishAvance}
        />
      )}

      {showObservacionesModal && (
        <ObservacionesModal
          reclamo={reclamoObservaciones}
          onClose={handleCloseObservaciones}
          onFinish={handleFinishObservaciones}
        />
      )}

      <Toast visible={toastVisible} message={toastMessage} type="success" />
    </div>
  );
}

export default Reclamos;
