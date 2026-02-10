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
import * as XLSX from "xlsx";
import InvoiceForm from "../invoice/InvoiceForm";
import SolucionModal from "./SolucionModal";
import AvanceModal from "./AvanceModal";
import ObservacionesModal from "./ObservacionesModal";
import RechazoModal from "./RechazoModal";
import AprobacionModal from "./AprobacionModal";
import ReclamoDetalleModal from "./ReclamoDetalleModal";
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
  const [productos, setProductos] = useState([]);
  const [tiposProducto, setTiposProducto] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [causas, setCausas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
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

  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [reclamoRechazo, setReclamoRechazo] = useState(null);

  const [showAprobacionModal, setShowAprobacionModal] = useState(false);
  const [reclamoAprobacion, setReclamoAprobacion] = useState(null);

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [reclamoDetalle, setReclamoDetalle] = useState(null);

  // Filtros
  const [filtro, setFiltro] = useState({
    cliente: "",
    estadoId: null,
    tipoId: null,
    procesoId: null,
    asesor: "",
    cumplimiento: null,
    fechaDesde: "",
    fechaHasta: "",
  });

  const resetFiltro = () =>
    setFiltro({
      cliente: "",
      estadoId: null,
      tipoId: null,
      procesoId: null,
      asesor: "",
      cumplimiento: null,
      fechaDesde: "",
      fechaHasta: "",
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
    fetchCatalogos();
  }, []);

  const fetchCatalogos = async () => {
    try {
      const [
        estadosRes,
        areasRes,
        matrizRes,
        productosRes,
        tiposRes,
        clasificacionesRes,
        clasesRes,
        causasRes,
        usuariosRes,
      ] = await Promise.all([
        authFetch(`${API_BASE}/estados-reclamo`),
        authFetch(`${API_BASE}/area`),
        authFetch(`${API_BASE}/matriz-direccionamiento`),
        authFetch(`${API_BASE}/productos`),
        authFetch(`${API_BASE}/tipos-producto`),
        authFetch(`${API_BASE}/clasificaciones-matriz`),
        authFetch(`${API_BASE}/clases-matriz`),
        authFetch(`${API_BASE}/causas-matriz`),
        authFetch(`${API_BASE}/usuarios`),
      ]);

      const estadosJson = await estadosRes.json();
      if (estadosRes.ok) setEstadosReclamo(estadosJson.data || []);

      const areasJson = await areasRes.json();
      if (areasRes.ok) setAreas(areasJson.data || []);

      const matrizJson = await matrizRes.json();
      if (matrizRes.ok) setMatrices(matrizJson.data || []);

      const productosJson = await productosRes.json();
      if (productosRes.ok) setProductos(productosJson.data || []);

      const tiposJson = await tiposRes.json();
      if (tiposRes.ok) setTiposProducto(tiposJson.data || []);

      const clasificacionesJson = await clasificacionesRes.json();
      if (clasificacionesRes.ok)
        setClasificaciones(clasificacionesJson.data || []);

      const clasesJson = await clasesRes.json();
      if (clasesRes.ok) setClases(clasesJson.data || []);

      const causasJson = await causasRes.json();
      if (causasRes.ok) setCausas(causasJson.data || []);

      const usuariosJson = await usuariosRes.json();
      if (usuariosRes.ok) setUsuarios(usuariosJson.data || []);
    } catch (error) {
      console.error("Error al cargar catalogos:", error);
    }
  };

  const shouldNotifyProximos = () => {
    const today = new Date().toISOString().slice(0, 10);
    const lastNotified = localStorage.getItem(
      "reclamos_proximos_notificados"
    );
    return lastNotified !== today;
  };

  const markNotifiedProximos = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("reclamos_proximos_notificados", today);
  };

  const notifyProximosVencer = async (force = false) => {
    if (!force && !shouldNotifyProximos()) return;
    try {
      setIsNotifying(true);
      const res = await authFetch(
        `${API_BASE}/reclamos/notificar-proximos-vencer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dias: 2 }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        markNotifiedProximos();
        setToastMessage(
          json?.count
            ? `Recordatorio enviado (${json.count})`
            : "Recordatorio enviado"
        );
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      } else {
        setToastMessage(json?.message || "No se pudo enviar el recordatorio");
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      }
    } catch (error) {
      console.error("Error notificando proximos a vencer:", error);
      setToastMessage("Error al enviar recordatorio");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } finally {
      setIsNotifying(false);
    }
  };

  const fetchReclamos = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/reclamos`);
      const json = await res.json();
      if (res.ok) {
        const data = json.data || [];
        setReclamos(data);
        notifyProximosVencer();
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

  const getDateOnlyValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.split("T")[0];
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const getDaysUntil = (value) => {
    const dateStr = getDateOnlyValue(value);
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map((part) => parseInt(part));
    const target = new Date(year, month - 1, day);
    const today = new Date();
    const startToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const diffMs = target.getTime() - startToday.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const getProductoNombre = (productoId) => {
    const producto = productos.find((p) => p.id === parseInt(productoId, 10));
    return producto ? producto.nombre : "N/A";
  };

  const getTipoProductoNombre = (tipoProductoId) => {
    const tipo = tiposProducto.find((t) => t.id === parseInt(tipoProductoId));
    return tipo ? tipo.nombre : "N/A";
  };

  const getClasificacionNombre = (clasificacionId) => {
    const item = clasificaciones.find(
      (c) => c.id === parseInt(clasificacionId, 10)
    );
    return item ? item.nombre : "N/A";
  };

  const getClaseNombre = (claseId) => {
    const item = clases.find((c) => c.id === parseInt(claseId, 10));
    return item ? item.nombre : "N/A";
  };

  const getCausaNombre = (causaId) => {
    const item = causas.find((c) => c.id === parseInt(causaId, 10));
    return item ? item.nombre : "N/A";
  };

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find((u) => u.id === parseInt(usuarioId, 10));
    if (!usuario) return "N/A";
    const nombreCompleto = `${usuario.nombre || ""} ${
      usuario.apellidos || ""
    }`.trim();
    return nombreCompleto || usuario.usuario || "N/A";
  };

  const isResponsibleForArea = (areaId) => {
    const area = areas.find((a) => a.id === parseInt(areaId, 10));
    return area && area.responsable === usuarioId;
  };

  const handleViewDetail = (row) => {
    setReclamoDetalle(row);
    setShowDetalleModal(true);
  };

  const handleCloseDetalle = () => {
    setShowDetalleModal(false);
    setReclamoDetalle(null);
  };

  const handleEditFromDetalle = () => {
    if (!reclamoDetalle) return;
    handleCloseDetalle();
    handleEdit(reclamoDetalle);
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

  const handleAprobar = (row) => {
    setReclamoAprobacion(row);
    setShowAprobacionModal(true);
  };

  const handleRechazar = (row) => {
    setReclamoRechazo(row);
    setShowRechazoModal(true);
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

  const handleCloseAprobacion = () => {
    setShowAprobacionModal(false);
    setReclamoAprobacion(null);
  };

  const handleFinishAprobacion = (response) => {
    setShowAprobacionModal(false);
    setReclamoAprobacion(null);
    fetchReclamos();
    if (response?.warning) {
      setToastMessage(response.warning);
    } else {
      setToastMessage("Reclamo aprobado y cerrado correctamente");
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleCloseRechazo = () => {
    setShowRechazoModal(false);
    setReclamoRechazo(null);
  };

  const handleFinishRechazo = () => {
    setShowRechazoModal(false);
    setReclamoRechazo(null);
    fetchReclamos();
    setToastMessage("Reclamo rechazado, vuelve a tratamiento");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const getFilteredRows = (rows) =>
    rows.filter((row) => {
      const clienteMatch = (row.cliente || "")
        .toLowerCase()
        .includes(filtro.cliente.toLowerCase());

      const asesorMatch = (row.asesor || "")
        .toLowerCase()
        .includes(filtro.asesor.toLowerCase());

      const estadoMatch = filtro.estadoId
        ? parseInt(row.estado_id, 10) === parseInt(filtro.estadoId, 10)
        : true;

      const procesoMatch = filtro.procesoId
        ? parseInt(row.proceso_responsable, 10) ===
          parseInt(filtro.procesoId, 10)
        : true;

      const tipoMatch = filtro.tipoId
        ? parseInt(row.producto_id, 10) === parseInt(filtro.tipoId, 10)
        : true;

      const rowCumplimiento =
        row.cumplimiento === true || row.cumplimiento === 1
          ? true
          : row.cumplimiento === false || row.cumplimiento === 0
          ? false
          : null;
      const cumplimientoMatch =
        filtro.cumplimiento === null
          ? true
          : rowCumplimiento === filtro.cumplimiento;

      const rowDate = getDateOnlyValue(row.fecha_creacion);
      const desdeMatch = filtro.fechaDesde
        ? rowDate && rowDate >= filtro.fechaDesde
        : true;
      const hastaMatch = filtro.fechaHasta
        ? rowDate && rowDate <= filtro.fechaHasta
        : true;

      return (
        clienteMatch &&
        asesorMatch &&
        estadoMatch &&
        procesoMatch &&
        tipoMatch &&
        cumplimientoMatch &&
        desdeMatch &&
        hastaMatch
      );
    });

  const estadoOptions = useMemo(
    () =>
      estadosReclamo.map((estado) => ({
        value: estado.id,
        label: estado.nombre,
      })),
    [estadosReclamo]
  );

  const tipoOptions = useMemo(
    () =>
      productos.map((producto) => ({
        value: producto.id,
        label: producto.nombre,
      })),
    [productos]
  );

  const procesoOptions = useMemo(
    () =>
      areas.map((area) => ({
        value: area.id,
        label: area.nombre,
      })),
    [areas]
  );

  const cumplimientoOptions = useMemo(
    () => [
      { value: true, label: "Cumple" },
      { value: false, label: "No cumple" },
    ],
    []
  );

  const proximosAVencer = useMemo(() => {
    return getFilteredRows(todosReclamos).filter((row) => {
      if (!row.fecha_limite_teorico) return false;
      if (row.fecha_cierre_definitiva) return false;
      const diasRestantes = getDaysUntil(row.fecha_limite_teorico);
      return diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 2;
    });
  }, [todosReclamos, filtro]);

  const normalizeExportValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (error) {
        return "[Objeto]";
      }
    }
    return value;
  };

  const formatExportDate = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.split("T")[0];
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const headerAliases = {
    estado_id: "Estado",
    proceso_responsable: "Proceso responsable",
    area_id: "Area",
    producto_id: "Producto",
    tipo_producto_id: "Tipo producto",
    clasificacion_id: "Clasificacion",
    clase_id: "Clase",
    causa_id: "Causa",
    persona_responsable: "Responsable",
    primer_contacto_id: "Primer contacto",
    usuario_id: "Usuario",
    fecha_creacion: "Fecha creacion",
    fecha_limite_teorico: "Fecha limite",
    fecha_cierre_definitiva: "Fecha cierre",
    descripcion_caso: "Descripcion",
    cumplimiento: "Cumplimiento",
  };

  const toTitleCase = (value) =>
    value
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

  const normalizeHeader = (key) => {
    if (headerAliases[key]) return headerAliases[key];
    if (key.endsWith("_id_nombre")) {
      return toTitleCase(key.replace(/_id_nombre$/, "").replace(/_/g, " "));
    }
    if (key.endsWith("_nombre")) {
      return toTitleCase(key.replace(/_nombre$/, "").replace(/_/g, " "));
    }
    if (key.endsWith("_id")) {
      return toTitleCase(key.replace(/_id$/, "").replace(/_/g, " "));
    }
    return toTitleCase(key.replace(/_/g, " "));
  };

  const excludedExportKeys = new Set([
    "creado_por",
    "activo",
    "created_at",
    "carta_adjunta_path",
  ]);

  const boolean01Keys = new Set([
    "justificado",
    "no_justificado",
    "incertidumbre",
  ]);

  const dateOnlyKeys = new Set([
    "fecha_creacion",
    "fecha_limite_teorico",
    "fecha_cierre_definitiva",
  ]);

  const getExportValue = (key, value) => {
    if (key === "cumplimiento") {
      if (value === true || value === 1) return "Cumple";
      if (value === false || value === 0) return "No cumple";
      return "";
    }

    if (boolean01Keys.has(key)) {
      if (value === true || value === 1) return 1;
      if (value === false || value === 0) return 0;
      return "";
    }

    if (dateOnlyKeys.has(key)) {
      return formatExportDate(value);
    }

    return value;
  };

  const resolveGenericForeignName = (key, row) => {
    const baseKey = key.replace(/_id$/, "");
    const byNombre = row?.[`${baseKey}_nombre`];
    if (byNombre) return byNombre;
    const byBase = row?.[baseKey];
    if (typeof byBase === "string" && byBase.trim()) return byBase;
    return "N/A";
  };

  const buildExportSchema = (rows) => {
    const headerSet = new Set();
    const schema = [];
    const orderedKeys = [];

    rows.forEach((row) => {
      Object.keys(row || {}).forEach((key) => {
        if (!orderedKeys.includes(key)) orderedKeys.push(key);
      });
    });

    const foreignKeyResolvers = {
      estado_id: (value) => getEstadoNombre(value),
      proceso_responsable: (value) => getAreaNombre(value),
      area_id: (value) => getAreaNombre(value),
      producto_id: (value) => getProductoNombre(value),
      tipo_producto_id: (value) => getTipoProductoNombre(value),
      clasificacion_id: (value) => getClasificacionNombre(value),
      clase_id: (value) => getClaseNombre(value),
      causa_id: (value) => getCausaNombre(value),
      persona_responsable: (value) => getUsuarioNombre(value),
      primer_contacto_id: (value) => getUsuarioNombre(value),
      usuario_id: (value) => getUsuarioNombre(value),
    };

    orderedKeys.forEach((key) => {
      if (excludedExportKeys.has(key)) return;

      if (foreignKeyResolvers[key]) {
        const header = normalizeHeader(`${key}_nombre`);
        if (!headerSet.has(header)) {
          headerSet.add(header);
          schema.push({
            header,
            getValue: (row) => foreignKeyResolvers[key](row?.[key]),
          });
        }
        return;
      }

      if (key.endsWith("_id")) {
        const header = normalizeHeader(`${key}_nombre`);
        if (!headerSet.has(header)) {
          headerSet.add(header);
          schema.push({
            header,
            getValue: (row) => resolveGenericForeignName(key, row),
          });
        }
        return;
      }

      const header = normalizeHeader(key);
      if (!headerSet.has(header)) {
        headerSet.add(header);
        schema.push({
          header,
          getValue: (row) => getExportValue(key, row?.[key]),
        });
      }
    });

    return schema;
  };

  const handleExportExcel = () => {
    const rows = getFilteredRows(todosReclamos);
    const schema = buildExportSchema(rows);

    const data = rows.map((row) => {
      const item = {};
      schema.forEach((col) => {
        item[col.header] = normalizeExportValue(col.getValue(row));
      });
      return item;
    });

    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: schema.map((col) => col.header),
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reclamos");

    XLSX.writeFile(
      workbook,
      `reclamos_${new Date().toISOString().slice(0, 10)}.xlsx`,
      { bookType: "xlsx" }
    );
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
              {getFilteredRows(rows).map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleViewDetail(row)}
                  className="clickable-row"
                >
                  <td>{row.id}</td>
                  <td>
                    <span
                      className={`badge ${getEstadoBadgeClass(row.estado_id)}`}
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
                          usuarioRol === "administrador" ||
                          isLiderReclamos(usuarioRol)) &&
                          row.estado_id === 6 &&
                          (isLiderReclamos(usuarioRol) ||
                            parseInt(row.persona_responsable, 10) ===
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

          {(isLiderReclamos(usuarioRol) || usuarioRol === "administrador") && (
            <button
              className="action primary"
              onClick={() => notifyProximosVencer(true)}
              disabled={isNotifying}
            >
              {isNotifying ? (
                <span className="loading-spinner" aria-hidden="true" />
              ) : (
                <CheckCircle size={16} />
              )}
              <span>
                {isNotifying ? "Enviando recordatorio..." : "Enviar recordatorio"}
              </span>
            </button>
          )}

          <button className="action primary" onClick={handleExportExcel}>
            <FileText size={16} />
            <span>Exportar Excel</span>
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
        <div className="filters-row">
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="filter-input"
            value={filtro.cliente}
            onChange={(e) =>
              setFiltro((f) => ({ ...f, cliente: e.target.value }))
            }
          />

          <div className="filter-select">
            <Select
              options={estadoOptions}
              isClearable
              placeholder="Estado"
              value={estadoOptions.find((opt) => opt.value === filtro.estadoId)}
              onChange={(option) =>
                setFiltro((f) => ({
                  ...f,
                  estadoId: option ? option.value : null,
                }))
              }
            />
          </div>

          <div className="filter-select">
            <Select
              options={tipoOptions}
              isClearable
              placeholder="Tipo"
              value={tipoOptions.find((opt) => opt.value === filtro.tipoId)}
              onChange={(option) =>
                setFiltro((f) => ({
                  ...f,
                  tipoId: option ? option.value : null,
                }))
              }
            />
          </div>

          <div className="filter-select">
            <Select
              options={procesoOptions}
              isClearable
              placeholder="Proceso"
              value={procesoOptions.find(
                (opt) => opt.value === filtro.procesoId
              )}
              onChange={(option) =>
                setFiltro((f) => ({
                  ...f,
                  procesoId: option ? option.value : null,
                }))
              }
            />
          </div>

          <div className="filter-select">
            <Select
              options={cumplimientoOptions}
              isClearable
              placeholder="Cumplimiento"
              value={cumplimientoOptions.find(
                (opt) => opt.value === filtro.cumplimiento
              )}
              onChange={(option) =>
                setFiltro((f) => ({
                  ...f,
                  cumplimiento: option ? option.value : null,
                }))
              }
            />
          </div>
        </div>

        <div className="filters-row">
          <input
            type="text"
            placeholder="Asesor"
            className="filter-input"
            value={filtro.asesor}
            onChange={(e) =>
              setFiltro((f) => ({ ...f, asesor: e.target.value }))
            }
          />

          <input
            type="date"
            className="filter-input"
            value={filtro.fechaDesde}
            onChange={(e) =>
              setFiltro((f) => ({ ...f, fechaDesde: e.target.value }))
            }
          />

          <input
            type="date"
            className="filter-input"
            value={filtro.fechaHasta}
            onChange={(e) =>
              setFiltro((f) => ({ ...f, fechaHasta: e.target.value }))
            }
          />

          <button className="action primary" onClick={resetFiltro}>
            Limpiar filtros
          </button>
        </div>
      </div>

      {proximosAVencer.length > 0 && (
        <TableSection title="Proximos a vencer" data={proximosAVencer} />
      )}

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

      {showRechazoModal && (
        <RechazoModal
          reclamo={reclamoRechazo}
          onClose={handleCloseRechazo}
          onFinish={handleFinishRechazo}
        />
      )}

      {showAprobacionModal && (
        <AprobacionModal
          reclamo={reclamoAprobacion}
          onClose={handleCloseAprobacion}
          onFinish={handleFinishAprobacion}
        />
      )}

      {showDetalleModal && (
        <ReclamoDetalleModal
          reclamo={reclamoDetalle}
          onClose={handleCloseDetalle}
          onEdit={handleEditFromDetalle}
          canEdit={!isReadOnlyRole(usuarioRol)}
          helpers={{
            fmtDate,
            fmtTs,
            getEstadoNombre,
            getAreaNombre,
            getUsuarioNombre,
            getProductoNombre,
            getClasificacionNombre,
            getClaseNombre,
            getCausaNombre,
          }}
        />
      )}

      <Toast visible={toastVisible} message={toastMessage} type="success" />
    </div>
  );
}

export default Reclamos;
