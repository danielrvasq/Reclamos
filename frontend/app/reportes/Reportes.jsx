"use client";
import { useMemo, useState, useEffect } from "react";
import { FileBarChart, RotateCcw } from "lucide-react";
import Select from "react-select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Reportes.css";
import InvoiceForm from "../invoice/InvoiceForm";
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { authFetch } from "../utils/authFetch";
import { FiBox, FiCheckCircle, FiList, FiXCircle } from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function Reportes() {
  // Estados para datos
  const [reclamos, setReclamos] = useState([]);
  const [estadosReclamo, setEstadosReclamo] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiposProducto, setTiposProducto] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [causas, setCausas] = useState([]);
  const [matrizDireccionamiento, setMatrizDireccionamiento] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedEstados, setSelectedEstados] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedCalificacion, setSelectedCalificacion] = useState("");
  const [selectedCumplimiento, setSelectedCumplimiento] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [chartMode, setChartMode] = useState("count"); // count | percent

  // Resultados y detalle
  const [showResults, setShowResults] = useState(false);
  const [selectedReclamo, setSelectedReclamo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        reclamosRes,
        estadosRes,
        productosRes,
        tiposRes,
        clasificacionesRes,
        clasesRes,
        causasRes,
        matrizRes,
        areasRes,
      ] = await Promise.all([
        authFetch(`${API_BASE}/reclamos`),
        authFetch(`${API_BASE}/estados-reclamo`),
        authFetch(`${API_BASE}/productos`),
        authFetch(`${API_BASE}/tipos-producto`),
        authFetch(`${API_BASE}/clasificaciones-matriz`),
        authFetch(`${API_BASE}/clases-matriz`),
        authFetch(`${API_BASE}/causas-matriz`),
        authFetch(`${API_BASE}/matriz-direccionamiento`),
        authFetch(`${API_BASE}/area`),
      ]);

      const reclamosData = await reclamosRes.json();
      const estadosData = await estadosRes.json();
      const productosData = await productosRes.json();
      const tiposData = await tiposRes.json();
      const clasificacionesData = await clasificacionesRes.json();
      const clasesData = await clasesRes.json();
      const causasData = await causasRes.json();
      const matrizData = await matrizRes.json();
      const areasData = await areasRes.json();

      if (reclamosRes.ok) setReclamos(reclamosData.data || []);
      if (estadosRes.ok) setEstadosReclamo(estadosData.data || []);
      if (productosRes.ok) setProductos(productosData.data || []);
      if (tiposRes.ok) setTiposProducto(tiposData.data || []);
      if (clasificacionesRes.ok)
        setClasificaciones(clasificacionesData.data || []);
      if (clasesRes.ok) setClases(clasesData.data || []);
      if (causasRes.ok) setCausas(causasData.data || []);
      if (matrizRes.ok) setMatrizDireccionamiento(matrizData.data || []);
      if (areasRes.ok) setAreas(areasData.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) => {
    if (!d) return "N/A";
    let dateStr = d;
    if (typeof d === "string") {
      dateStr = d.split("T")[0];
      const [year, month, day] = dateStr.split("-");
      return new Date(year, month - 1, day).toLocaleDateString("es-CO");
    }
    return new Date(d).toLocaleDateString("es-CO");
  };

  const getEstadoNombre = (estadoId) => {
    const estado = estadosReclamo.find((e) => e.id === estadoId);
    return estado ? estado.nombre : "Sin estado";
  };

  const getEstadoBadgeClass = (estadoId) => {
    const estado = estadosReclamo.find((e) => e.id === estadoId);
    if (!estado || !estado.color) return "badge-muted";
    const colorMap = {
      1: "badge-info",
      2: "badge-warning",
      3: "badge-success",
      4: "badge-danger",
      5: "badge-muted",
    };
    return colorMap[estado.color] || "badge-info";
  };

  const getProductoNombre = (productoId) => {
    const producto = productos.find((p) => p.id === parseInt(productoId));
    return producto ? producto.nombre : "N/A";
  };

  const getAreaNombre = (areaId) => {
    const area = areas.find((a) => a.id === parseInt(areaId));
    return area ? area.nombre : "N/A";
  };

  const stats = useMemo(() => {
    const totalReclamos = reclamos.length;

    // Agrupar por estado
    const porEstado = {};
    estadosReclamo.forEach((estado) => {
      porEstado[estado.id] = reclamos.filter(
        (r) => r.estado_id === estado.id
      ).length;
    });

    // Agrupar por área
    const porArea = {};
    areas.forEach((area) => {
      porArea[area.id] = reclamos.filter(
        (r) => parseInt(r.proceso_responsable) === area.id
      ).length;
    });

    // Calcular cumplimiento
    const cumplidos = reclamos.filter(
      (r) => r.cumplimiento === true || r.cumplimiento === 1
    ).length;
    const noCumplidos = reclamos.filter(
      (r) => r.cumplimiento === false || r.cumplimiento === 0
    ).length;

    // Calificaciones
    const justificados = reclamos.filter((r) => r.justificado).length;
    const noJustificados = reclamos.filter((r) => r.no_justificado).length;
    const incertidumbre = reclamos.filter((r) => r.incertidumbre).length;

    // Productos únicos
    const productosUnicos = new Set(reclamos.map((r) => r.producto_id)).size;

    return {
      totalReclamos,
      porEstado,
      porArea,
      cumplidos,
      noCumplidos,
      justificados,
      noJustificados,
      incertidumbre,
      productosUnicos,
    };
  }, [reclamos, estadosReclamo, areas]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const comparisonYears = useMemo(
    () => [currentYear, currentYear - 1, currentYear - 2],
    [currentYear]
  );

  const monthlyComparisonData = useMemo(() => {
    const monthLabels = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const base = comparisonYears.reduce((acc, year) => {
      acc[year] = Array(12).fill(0);
      return acc;
    }, {});

    reclamos.forEach((r) => {
      if (!r.fecha_creacion) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = d.getMonth();
      if (comparisonYears.includes(year) && month >= 0 && month < 12) {
        base[year][month] += 1;
      }
    });

    return monthLabels.map((label, idx) => {
      const row = { month: label };
      comparisonYears.forEach((year) => {
        row[year] = base[year][idx] || 0;
      });
      return row;
    });
  }, [comparisonYears, reclamos]);

  const monthlyChartData = useMemo(() => {
    if (chartMode === "count") return monthlyComparisonData;
    const keys = comparisonYears.map((y) => `${y}`);
    return monthlyComparisonData.map((row) => {
      const total = keys.reduce((sum, key) => sum + (row[key] || 0), 0);
      if (!total) return { ...row };
      const next = { month: row.month };
      keys.forEach((key) => {
        next[key] = parseFloat(((row[key] || 0) * 100) / total).toFixed(2);
      });
      return next;
    });
  }, [chartMode, comparisonYears, monthlyComparisonData]);

  const calificacionComparisonData = useMemo(() => {
    const labels = [
      { key: "Justificado", check: (r) => r.justificado },
      { key: "No Justificado", check: (r) => r.no_justificado },
      { key: "Incertidumbre", check: (r) => r.incertidumbre },
    ];

    const base = labels.reduce((acc, label) => {
      acc[label.key] = comparisonYears.reduce((yearMap, year) => {
        yearMap[year] = 0;
        return yearMap;
      }, {});
      return acc;
    }, {});

    reclamos.forEach((r) => {
      if (!r.fecha_creacion) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      if (!comparisonYears.includes(year)) return;

      const label = labels.find((l) => l.check(r));
      if (!label) return;
      base[label.key][year] += 1;
    });

    return labels.map((label) => {
      const row = { calificacion: label.key };
      comparisonYears.forEach((year) => {
        row[year] = base[label.key][year] || 0;
      });
      return row;
    });
  }, [comparisonYears, reclamos]);

  const calificacionChartData = useMemo(() => {
    if (chartMode === "count") return calificacionComparisonData;
    const totalsByYear = comparisonYears.reduce((acc, year) => {
      acc[year] = 0;
      return acc;
    }, {});

    calificacionComparisonData.forEach((row) => {
      comparisonYears.forEach((year) => {
        totalsByYear[year] += row[year] || 0;
      });
    });

    return calificacionComparisonData.map((row) => {
      const next = { calificacion: row.calificacion };
      comparisonYears.forEach((year) => {
        const total = totalsByYear[year] || 0;
        next[year] = total
          ? parseFloat(((row[year] || 0) * 100) / total).toFixed(2)
          : 0;
      });
      return next;
    });
  }, [calificacionComparisonData, chartMode, comparisonYears]);

  const tiposProductoComparisonData = useMemo(() => {
    const base = tiposProducto.reduce((acc, tipo) => {
      acc[tipo.id] = comparisonYears.reduce((yearMap, year) => {
        yearMap[year] = 0;
        return yearMap;
      }, {});
      return acc;
    }, {});

    reclamos.forEach((r) => {
      if (!r.fecha_creacion || !r.producto_id) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      if (!comparisonYears.includes(year)) return;

      const producto = productos.find((p) => p.id === r.producto_id);
      if (!producto || !producto.tipo_producto_id) return;
      const tipoId = producto.tipo_producto_id;

      if (base[tipoId]) {
        base[tipoId][year] += 1;
      }
    });

    return tiposProducto.map((tipo) => {
      const row = { tipo: tipo.nombre || `Tipo ${tipo.id}` };
      comparisonYears.forEach((year) => {
        row[year] = base[tipo.id]?.[year] || 0;
      });
      return row;
    });
  }, [tiposProducto, reclamos, productos, comparisonYears]);

  const tiposProductoChartData = useMemo(() => {
    if (chartMode === "count") return tiposProductoComparisonData;
    const totalsByYear = comparisonYears.reduce((acc, year) => {
      acc[year] = 0;
      return acc;
    }, {});

    tiposProductoComparisonData.forEach((row) => {
      comparisonYears.forEach((year) => {
        totalsByYear[year] += row[year] || 0;
      });
    });

    return tiposProductoComparisonData.map((row) => {
      const next = { tipo: row.tipo };
      comparisonYears.forEach((year) => {
        const total = totalsByYear[year] || 0;
        next[year] = total
          ? parseFloat(((row[year] || 0) * 100) / total).toFixed(2)
          : 0;
      });
      return next;
    });
  }, [tiposProductoComparisonData, chartMode, comparisonYears]);

  const clasificacionesComparisonData = useMemo(() => {
    const base = clasificaciones.reduce((acc, item) => {
      acc[item.id] = comparisonYears.reduce((yearMap, year) => {
        yearMap[year] = 0;
        return yearMap;
      }, {});
      return acc;
    }, {});

    reclamos.forEach((r) => {
      if (!r.fecha_creacion || !r.clasificacion_id) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      if (!comparisonYears.includes(year)) return;

      if (base[r.clasificacion_id]) {
        base[r.clasificacion_id][year] += 1;
      }
    });

    return clasificaciones.map((item) => {
      const row = { nombre: item.nombre || `Clasificación ${item.id}` };
      comparisonYears.forEach((year) => {
        row[year] = base[item.id]?.[year] || 0;
      });
      return row;
    });
  }, [clasificaciones, reclamos, comparisonYears]);

  const clasificacionesChartData = useMemo(() => {
    if (chartMode === "count") return clasificacionesComparisonData;
    const totalsByYear = comparisonYears.reduce((acc, year) => {
      acc[year] = 0;
      return acc;
    }, {});

    clasificacionesComparisonData.forEach((row) => {
      comparisonYears.forEach((year) => {
        totalsByYear[year] += row[year] || 0;
      });
    });

    return clasificacionesComparisonData.map((row) => {
      const next = { nombre: row.nombre };
      comparisonYears.forEach((year) => {
        const total = totalsByYear[year] || 0;
        next[year] = total
          ? parseFloat(((row[year] || 0) * 100) / total).toFixed(2)
          : 0;
      });
      return next;
    });
  }, [clasificacionesComparisonData, chartMode, comparisonYears]);

  const clasesComparisonData = useMemo(() => {
    const base = clases.reduce((acc, item) => {
      acc[item.id] = comparisonYears.reduce((yearMap, year) => {
        yearMap[year] = 0;
        return yearMap;
      }, {});
      return acc;
    }, {});

    reclamos.forEach((r) => {
      if (!r.fecha_creacion || !r.clase_id) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      if (!comparisonYears.includes(year)) return;

      if (base[r.clase_id]) {
        base[r.clase_id][year] += 1;
      }
    });

    return clases.map((item) => {
      const row = { nombre: item.nombre || `Clase ${item.id}` };
      comparisonYears.forEach((year) => {
        row[year] = base[item.id]?.[year] || 0;
      });
      return row;
    });
  }, [clases, reclamos, comparisonYears]);

  const clasesChartData = useMemo(() => {
    if (chartMode === "count") return clasesComparisonData;
    const totalsByYear = comparisonYears.reduce((acc, year) => {
      acc[year] = 0;
      return acc;
    }, {});

    clasesComparisonData.forEach((row) => {
      comparisonYears.forEach((year) => {
        totalsByYear[year] += row[year] || 0;
      });
    });

    return clasesComparisonData.map((row) => {
      const next = { nombre: row.nombre };
      comparisonYears.forEach((year) => {
        const total = totalsByYear[year] || 0;
        next[year] = total
          ? parseFloat(((row[year] || 0) * 100) / total).toFixed(2)
          : 0;
      });
      return next;
    });
  }, [clasesComparisonData, chartMode, comparisonYears]);

  const causasComparisonData = useMemo(() => {
    const base = causas.reduce((acc, item) => {
      acc[item.id] = comparisonYears.reduce((yearMap, year) => {
        yearMap[year] = 0;
        return yearMap;
      }, {});
      return acc;
    }, {});

    reclamos.forEach((r) => {
      if (!r.fecha_creacion || !r.causa_id) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      if (!comparisonYears.includes(year)) return;

      if (base[r.causa_id]) {
        base[r.causa_id][year] += 1;
      }
    });

    return causas.map((item) => {
      const row = { nombre: item.nombre || `Causa ${item.id}` };
      comparisonYears.forEach((year) => {
        row[year] = base[item.id]?.[year] || 0;
      });
      return row;
    });
  }, [causas, reclamos, comparisonYears]);

  const causasChartData = useMemo(() => {
    if (chartMode === "count") return causasComparisonData;
    const totalsByYear = comparisonYears.reduce((acc, year) => {
      acc[year] = 0;
      return acc;
    }, {});

    causasComparisonData.forEach((row) => {
      comparisonYears.forEach((year) => {
        totalsByYear[year] += row[year] || 0;
      });
    });

    return causasComparisonData.map((row) => {
      const next = { nombre: row.nombre };
      comparisonYears.forEach((year) => {
        const total = totalsByYear[year] || 0;
        next[year] = total
          ? parseFloat(((row[year] || 0) * 100) / total).toFixed(2)
          : 0;
      });
      return next;
    });
  }, [causasComparisonData, chartMode, comparisonYears]);

  const cerradosVsTotalComparisonData = useMemo(() => {
    const estadoCerradoId = estadosReclamo.find(
      (e) => e.nombre && e.nombre.toLowerCase().includes("cerrado")
    )?.id;

    const totalesPorAnio = comparisonYears.reduce((acc, year) => {
      acc[year] = { total: 0, cerrados: 0 };
      return acc;
    }, {});

    reclamos.forEach((r) => {
      if (!r.fecha_creacion) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      if (!comparisonYears.includes(year)) return;

      totalesPorAnio[year].total += 1;
      if (estadoCerradoId && r.estado_id === estadoCerradoId) {
        totalesPorAnio[year].cerrados += 1;
      }
    });

    return [
      {
        categoria: "Cerrados",
        ...comparisonYears.reduce((acc, year) => {
          acc[year] = totalesPorAnio[year].cerrados;
          return acc;
        }, {}),
      },
      {
        categoria: "Total",
        ...comparisonYears.reduce((acc, year) => {
          acc[year] = totalesPorAnio[year].total;
          return acc;
        }, {}),
      },
    ];
  }, [reclamos, estadosReclamo, comparisonYears]);

  const cerradosVsTotalChartData = useMemo(() => {
    if (chartMode === "count") return cerradosVsTotalComparisonData;

    return cerradosVsTotalComparisonData.map((row) => {
      const next = { categoria: row.categoria };
      comparisonYears.forEach((year) => {
        const totalDelAnio =
          cerradosVsTotalComparisonData.find((r) => r.categoria === "Total")?.[
            year
          ] || 0;

        if (row.categoria === "Cerrados") {
          next[year] = totalDelAnio
            ? parseFloat(((row[year] || 0) * 100) / totalDelAnio).toFixed(2)
            : 0;
        } else {
          next[year] = 100;
        }
      });
      return next;
    });
  }, [cerradosVsTotalComparisonData, chartMode, comparisonYears]);

  const procesosComparisonData = useMemo(() => {
    const areasFiltered = areas.filter((a) => a.id !== 1);

    const base = areasFiltered.reduce((acc, area) => {
      acc[area.id] = comparisonYears.reduce((yearMap, year) => {
        yearMap[year] = 0;
        return yearMap;
      }, {});
      return acc;
    }, {});

    reclamos.forEach((r) => {
      if (!r.fecha_creacion || !r.proceso_responsable) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      if (!comparisonYears.includes(year)) return;

      const areaId = parseInt(r.proceso_responsable);
      if (areaId === 1) return;

      if (base[areaId]) {
        base[areaId][year] += 1;
      }
    });

    return areasFiltered.map((area) => {
      const row = { nombre: area.nombre || `Área ${area.id}` };
      comparisonYears.forEach((year) => {
        row[year] = base[area.id]?.[year] || 0;
      });
      return row;
    });
  }, [areas, reclamos, comparisonYears]);

  const procesosChartData = useMemo(() => {
    if (chartMode === "count") return procesosComparisonData;
    const totalsByYear = comparisonYears.reduce((acc, year) => {
      acc[year] = 0;
      return acc;
    }, {});

    procesosComparisonData.forEach((row) => {
      comparisonYears.forEach((year) => {
        totalsByYear[year] += row[year] || 0;
      });
    });

    return procesosComparisonData.map((row) => {
      const next = { nombre: row.nombre };
      comparisonYears.forEach((year) => {
        const total = totalsByYear[year] || 0;
        next[year] = total
          ? parseFloat(((row[year] || 0) * 100) / total).toFixed(2)
          : 0;
      });
      return next;
    });
  }, [procesosComparisonData, chartMode, comparisonYears]);

  const tiempoRespuestaCausaData = useMemo(() => {
    const estadoCerradoId = estadosReclamo.find(
      (e) => e.nombre && e.nombre.toLowerCase().includes("cerrado")
    )?.id;

    const causaStats = {};

    causas.forEach((causa) => {
      causaStats[causa.id] = {
        nombre: causa.nombre || `Causa ${causa.id}`,
        totalDias: 0,
        count: 0,
        tiempoTeorico: null,
      };
    });

    // Calcular promedio real de días demorados por causa (solo cerrados)
    reclamos.forEach((r) => {
      if (!r.causa_id || r.estado_id !== estadoCerradoId) return;
      if (!r.dias_habiles_demora || r.dias_habiles_demora <= 0) return;

      if (causaStats[r.causa_id]) {
        causaStats[r.causa_id].totalDias += r.dias_habiles_demora;
        causaStats[r.causa_id].count += 1;
      }
    });

    // Obtener tiempo teórico de la matriz
    matrizDireccionamiento.forEach((matriz) => {
      if (matriz.causa_id && causaStats[matriz.causa_id]) {
        if (causaStats[matriz.causa_id].tiempoTeorico === null) {
          causaStats[matriz.causa_id].tiempoTeorico =
            matriz.tiempo_respuesta_dias || 0;
        }
      }
    });

    // Convertir a array y calcular promedios
    return Object.values(causaStats)
      .filter((stat) => stat.count > 0 || stat.tiempoTeorico !== null)
      .map((stat) => ({
        causa: stat.nombre,
        diasPromedio:
          stat.count > 0
            ? parseFloat((stat.totalDias / stat.count).toFixed(2))
            : null,
        tiempoRespuesta: stat.tiempoTeorico || 0,
      }))
      .sort((a, b) => a.causa.localeCompare(b.causa));
  }, [reclamos, causas, matrizDireccionamiento, estadosReclamo]);

  const tiempoRespuestaCausa2025Data = useMemo(() => {
    const estadoCerradoId = estadosReclamo.find(
      (e) => e.nombre && e.nombre.toLowerCase().includes("cerrado")
    )?.id;

    const causaStats = {};

    causas.forEach((causa) => {
      causaStats[causa.id] = {
        nombre: causa.nombre || `Causa ${causa.id}`,
        totalDias: 0,
        count: 0,
        tiempoTeorico: null,
      };
    });

    // Calcular promedio real de días demorados por causa (solo cerrados del 2025)
    reclamos.forEach((r) => {
      if (!r.causa_id || r.estado_id !== estadoCerradoId) return;
      if (!r.dias_habiles_demora || r.dias_habiles_demora <= 0) return;

      // Filtrar solo reclamos del 2025
      if (r.fecha_creacion) {
        const d = new Date(r.fecha_creacion);
        if (d.getFullYear() !== 2025) return;
      } else {
        return;
      }

      if (causaStats[r.causa_id]) {
        causaStats[r.causa_id].totalDias += r.dias_habiles_demora;
        causaStats[r.causa_id].count += 1;
      }
    });

    // Obtener tiempo teórico de la matriz
    matrizDireccionamiento.forEach((matriz) => {
      if (matriz.causa_id && causaStats[matriz.causa_id]) {
        if (causaStats[matriz.causa_id].tiempoTeorico === null) {
          causaStats[matriz.causa_id].tiempoTeorico =
            matriz.tiempo_respuesta_dias || 0;
        }
      }
    });

    // Convertir a array y calcular promedios
    return Object.values(causaStats)
      .filter((stat) => stat.count > 0 || stat.tiempoTeorico !== null)
      .map((stat) => ({
        causa: stat.nombre,
        diasPromedio:
          stat.count > 0
            ? parseFloat((stat.totalDias / stat.count).toFixed(2))
            : null,
        tiempoRespuesta: stat.tiempoTeorico || 0,
      }))
      .sort((a, b) => a.causa.localeCompare(b.causa));
  }, [reclamos, causas, matrizDireccionamiento, estadosReclamo]);

  const tiempoRespuestaCausa2026Data = useMemo(() => {
    const estadoCerradoId = estadosReclamo.find(
      (e) => e.nombre && e.nombre.toLowerCase().includes("cerrado")
    )?.id;

    const causaStats = {};

    causas.forEach((causa) => {
      causaStats[causa.id] = {
        nombre: causa.nombre || `Causa ${causa.id}`,
        totalDias: 0,
        count: 0,
        tiempoTeorico: null,
      };
    });

    // Calcular promedio real de días demorados por causa (solo cerrados del 2026)
    reclamos.forEach((r) => {
      if (!r.causa_id || r.estado_id !== estadoCerradoId) return;
      if (!r.dias_habiles_demora || r.dias_habiles_demora <= 0) return;

      // Filtrar solo reclamos del 2026
      if (r.fecha_creacion) {
        const d = new Date(r.fecha_creacion);
        if (d.getFullYear() !== 2026) return;
      } else {
        return;
      }

      if (causaStats[r.causa_id]) {
        causaStats[r.causa_id].totalDias += r.dias_habiles_demora;
        causaStats[r.causa_id].count += 1;
      }
    });

    // Obtener tiempo teórico de la matriz
    matrizDireccionamiento.forEach((matriz) => {
      if (matriz.causa_id && causaStats[matriz.causa_id]) {
        if (causaStats[matriz.causa_id].tiempoTeorico === null) {
          causaStats[matriz.causa_id].tiempoTeorico =
            matriz.tiempo_respuesta_dias || 0;
        }
      }
    });

    // Convertir a array y calcular promedios
    return Object.values(causaStats)
      .filter((stat) => stat.count > 0 || stat.tiempoTeorico !== null)
      .map((stat) => ({
        causa: stat.nombre,
        diasPromedio:
          stat.count > 0
            ? parseFloat((stat.totalDias / stat.count).toFixed(2))
            : null,
        tiempoRespuesta: stat.tiempoTeorico || 0,
      }))
      .sort((a, b) => a.causa.localeCompare(b.causa));
  }, [reclamos, causas, matrizDireccionamiento, estadosReclamo]);

  const clasificacionesMesComparisonData = useMemo(() => {
    const years = [2024, 2025, 2026];
    const monthLabels = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    // Inicializar estructura
    const base = clasificaciones.reduce((acc, clasificacion) => {
      acc[clasificacion.id] = {
        nombre: clasificacion.nombre || `Clasificación ${clasificacion.id}`,
        datos: {},
      };
      years.forEach((year) => {
        monthLabels.forEach((month, idx) => {
          acc[clasificacion.id].datos[`${year}-${idx}`] = 0;
        });
      });
      return acc;
    }, {});

    // Contar reclamos por clasificación, año y mes
    reclamos.forEach((r) => {
      if (!r.fecha_creacion || !r.clasificacion_id) return;
      const d = new Date(r.fecha_creacion);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = d.getMonth();

      if (years.includes(year) && base[r.clasificacion_id]) {
        base[r.clasificacion_id].datos[`${year}-${month}`] += 1;
      }
    });

    // Convertir a tabla con estructura: Clasificación | Ene 2024 | Feb 2024 | ... | Dic 2026
    return Object.values(base).map((item) => {
      const row = { clasificacion: item.nombre };
      years.forEach((year) => {
        monthLabels.forEach((month, idx) => {
          const key = `${year}${month}`;
          row[key] = item.datos[`${year}-${idx}`] || 0;
        });
      });
      return row;
    });
  }, [reclamos, clasificaciones]);

  const reclamosFiltrados = useMemo(() => {
    return reclamos.filter((r) => {
      const noFilters =
        selectedEstados.length === 0 &&
        selectedProductos.length === 0 &&
        selectedAreas.length === 0 &&
        !selectedCalificacion &&
        !selectedCumplimiento &&
        !fechaDesde &&
        !fechaHasta;

      if (noFilters) return true;

      const matchEstado =
        selectedEstados.length === 0 || selectedEstados.includes(r.estado_id);

      const matchProducto =
        selectedProductos.length === 0 ||
        selectedProductos.includes(r.producto_id);

      const matchArea =
        selectedAreas.length === 0 ||
        selectedAreas.includes(parseInt(r.proceso_responsable));

      const matchCalificacion =
        !selectedCalificacion ||
        (selectedCalificacion === "justificado" && r.justificado) ||
        (selectedCalificacion === "no_justificado" && r.no_justificado) ||
        (selectedCalificacion === "incertidumbre" && r.incertidumbre);

      const matchCumplimiento =
        !selectedCumplimiento ||
        (selectedCumplimiento === "cumple" &&
          (r.cumplimiento === true || r.cumplimiento === 1)) ||
        (selectedCumplimiento === "no_cumple" &&
          (r.cumplimiento === false || r.cumplimiento === 0));

      let matchFecha = true;
      if (fechaDesde || fechaHasta) {
        // Extraer solo la fecha (sin hora) del reclamo en formato yyyy-mm-dd
        const fechaReclamoStr = r.fecha_creacion
          ? r.fecha_creacion.split("T")[0]
          : "";
        if (!fechaReclamoStr) {
          matchFecha = false;
        } else {
          // Comparar directamente las fechas en formato yyyy-mm-dd (orden lexicográfico)
          if (fechaDesde && fechaReclamoStr < fechaDesde) {
            matchFecha = false;
          }
          if (fechaHasta && fechaReclamoStr > fechaHasta) {
            matchFecha = false;
          }
        }
      }

      return (
        matchEstado &&
        matchProducto &&
        matchArea &&
        matchCalificacion &&
        matchCumplimiento &&
        matchFecha
      );
    });
  }, [
    reclamos,
    selectedEstados,
    selectedProductos,
    selectedAreas,
    selectedCalificacion,
    selectedCumplimiento,
    fechaDesde,
    fechaHasta,
  ]);

  const handleGenerarReporte = () => {
    setShowResults(true);
    const el = document.getElementById("report-results");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="reportes-page">
      <div className="reportes-header">
        <h2>Reportes y Estadísticas</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          Cargando datos...
        </div>
      ) : (
        <>
          <div className="quick-stats">
            <div className="quick-stat">
              <div className="quick-value">
                {stats.totalReclamos} <FiList />
              </div>
              <div className="quick-label">Total Reclamos</div>
            </div>
            <div className="quick-stat">
              <div className="quick-value">
                {stats.productosUnicos} <FiBox />
              </div>
              <div className="quick-label">Productos</div>
            </div>
            <div className="quick-stat">
              <div className="quick-value">
                {stats.cumplidos} <FiCheckCircle />
              </div>
              <div className="quick-label">Cumplidos</div>
            </div>
            <div className="quick-stat">
              <div className="quick-value">
                {stats.noCumplidos} <FiXCircle />
              </div>
              <div className="quick-label">No Cumplidos</div>
            </div>
          </div>

          <div className="chart-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={chartMode === "percent"}
                onChange={(e) =>
                  setChartMode(e.target.checked ? "percent" : "count")
                }
              />
              Mostrar en porcentaje
            </label>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">
                Reclamos por Mes (Comparativa {comparisonYears[2]}-
                {comparisonYears[0]})
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    allowDecimals={chartMode === "percent"}
                    domain={
                      chartMode === "percent" ? [0, 100] : ["auto", "auto"]
                    }
                    tickFormatter={
                      chartMode === "percent" ? (v) => `${v}%` : undefined
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      chartMode === "percent" ? `${value}%` : value
                    }
                  />
                  <Legend />
                  {comparisonYears.map((year, idx) => {
                    const colors = ["#3b82f6", "#22c55e", "#f59e0b"];
                    return (
                      <Bar
                        key={year}
                        dataKey={`${year}`}
                        name={`Año ${year}`}
                        fill={colors[idx % colors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                Distribución por Calificación ({comparisonYears[2]}-
                {comparisonYears[0]})
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={calificacionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="calificacion" />
                  <YAxis
                    allowDecimals={chartMode === "percent"}
                    domain={
                      chartMode === "percent" ? [0, 100] : ["auto", "auto"]
                    }
                    tickFormatter={
                      chartMode === "percent" ? (v) => `${v}%` : undefined
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      chartMode === "percent" ? `${value}%` : value
                    }
                  />
                  <Legend />
                  {comparisonYears.map((year, idx) => {
                    const colors = ["#3b82f6", "#22c55e", "#f59e0b"];
                    return (
                      <Bar
                        key={year}
                        dataKey={`${year}`}
                        name={`Año ${year}`}
                        fill={colors[idx % colors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3 className="chart-title">
                Reclamos por Clasificación ({comparisonYears[2]}-
                {comparisonYears[0]})
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clasificacionesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis
                    allowDecimals={chartMode === "percent"}
                    domain={
                      chartMode === "percent" ? [0, 100] : ["auto", "auto"]
                    }
                    tickFormatter={
                      chartMode === "percent" ? (v) => `${v}%` : undefined
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      chartMode === "percent" ? `${value}%` : value
                    }
                  />
                  <Legend />
                  {comparisonYears.map((year, idx) => {
                    const colors = ["#3b82f6", "#22c55e", "#f59e0b"];
                    return (
                      <Bar
                        key={year}
                        dataKey={`${year}`}
                        name={`Año ${year}`}
                        fill={colors[idx % colors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                Reclamos por Clase ({comparisonYears[2]}-{comparisonYears[0]})
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clasesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis
                    allowDecimals={chartMode === "percent"}
                    domain={
                      chartMode === "percent" ? [0, 100] : ["auto", "auto"]
                    }
                    tickFormatter={
                      chartMode === "percent" ? (v) => `${v}%` : undefined
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      chartMode === "percent" ? `${value}%` : value
                    }
                  />
                  <Legend />
                  {comparisonYears.map((year, idx) => {
                    const colors = ["#3b82f6", "#22c55e", "#f59e0b"];
                    return (
                      <Bar
                        key={year}
                        dataKey={`${year}`}
                        name={`Año ${year}`}
                        fill={colors[idx % colors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                Reclamos por Causa ({comparisonYears[2]}-{comparisonYears[0]})
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={causasChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis
                    allowDecimals={chartMode === "percent"}
                    domain={
                      chartMode === "percent" ? [0, 100] : ["auto", "auto"]
                    }
                    tickFormatter={
                      chartMode === "percent" ? (v) => `${v}%` : undefined
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      chartMode === "percent" ? `${value}%` : value
                    }
                  />
                  <Legend />
                  {comparisonYears.map((year, idx) => {
                    const colors = ["#3b82f6", "#22c55e", "#f59e0b"];
                    return (
                      <Bar
                        key={year}
                        dataKey={`${year}`}
                        name={`Año ${year}`}
                        fill={colors[idx % colors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                Cerrados vs Total ({comparisonYears[2]}-{comparisonYears[0]})
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={cerradosVsTotalChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis
                    allowDecimals={chartMode === "percent"}
                    domain={
                      chartMode === "percent" ? [0, 100] : ["auto", "auto"]
                    }
                    tickFormatter={
                      chartMode === "percent" ? (v) => `${v}%` : undefined
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      chartMode === "percent" ? `${value}%` : value
                    }
                  />
                  <Legend />
                  {comparisonYears.map((year, idx) => {
                    const colors = ["#3b82f6", "#22c55e", "#f59e0b"];
                    return (
                      <Bar
                        key={year}
                        dataKey={`${year}`}
                        name={`Año ${year}`}
                        fill={colors[idx % colors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                Reclamos por Proceso ({comparisonYears[2]}-{comparisonYears[0]})
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={procesosChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis
                    allowDecimals={chartMode === "percent"}
                    domain={
                      chartMode === "percent" ? [0, 100] : ["auto", "auto"]
                    }
                    tickFormatter={
                      chartMode === "percent" ? (v) => `${v}%` : undefined
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      chartMode === "percent" ? `${value}%` : value
                    }
                  />
                  <Legend />
                  {comparisonYears.map((year, idx) => {
                    const colors = ["#3b82f6", "#22c55e", "#f59e0b"];
                    return (
                      <Bar
                        key={year}
                        dataKey={`${year}`}
                        name={`Año ${year}`}
                        fill={colors[idx % colors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                Días Hábiles Demorados vs Tiempo de Respuesta por Causa -
                Historico
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={tiempoRespuestaCausaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="causa"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="diasPromedio"
                    name="Días Hábiles Demorados (Promedio)"
                    fill="#60a5fa"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="tiempoRespuesta"
                    name="Tiempo de Respuesta (Días)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                Días Hábiles Demorados vs Tiempo de Respuesta por Causa - Año
                2025
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={tiempoRespuestaCausa2025Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="causa"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="diasPromedio"
                    name="Días Hábiles Demorados (Promedio)"
                    fill="#60a5fa"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="tiempoRespuesta"
                    name="Tiempo de Respuesta (Días)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">
                Días Hábiles Demorados vs Tiempo de Respuesta por Causa - Año
                2026
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={tiempoRespuestaCausa2026Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="causa"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="diasPromedio"
                    name="Días Hábiles Demorados (Promedio)"
                    fill="#60a5fa"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="tiempoRespuesta"
                    name="Tiempo de Respuesta (Días)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="report-section">
            <div className="report-header">
              <h3>
                Reclamos por Clasificación - Comparativa Mensual 2024/2025/2026
              </h3>
              <p>Tabla y gráfica detallada mes a mes por cada clasificación</p>
            </div>

            {clasificaciones.map((clasificacion) => {
              const monthLabels = [
                "Ene",
                "Feb",
                "Mar",
                "Abr",
                "May",
                "Jun",
                "Jul",
                "Ago",
                "Sep",
                "Oct",
                "Nov",
                "Dic",
              ];
              const years = [2024, 2025, 2026];

              // Calcular datos para esta clasificación
              const clasificacionData = {};
              years.forEach((year) => {
                monthLabels.forEach((month, idx) => {
                  clasificacionData[`${year}-${idx}`] = 0;
                });
              });

              reclamos.forEach((r) => {
                if (
                  !r.fecha_creacion ||
                  r.clasificacion_id !== clasificacion.id
                )
                  return;
                const d = new Date(r.fecha_creacion);
                if (Number.isNaN(d.getTime())) return;
                const year = d.getFullYear();
                const month = d.getMonth();

                if (years.includes(year)) {
                  clasificacionData[`${year}-${month}`] += 1;
                }
              });

              // Datos para gráfica (meses como X, años como series)
              const chartData = monthLabels.map((month, idx) => {
                const row = { mes: month };
                years.forEach((year) => {
                  row[year] = clasificacionData[`${year}-${idx}`] || 0;
                });
                return row;
              });

              return (
                <div key={clasificacion.id} style={{ marginBottom: "40px" }}>
                  <h4 style={{ marginBottom: "20px", color: "#2a2a2a" }}>
                    {clasificacion.nombre}
                  </h4>

                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        {years.map((year, idx) => {
                          const colors = ["#3b82f6", "#22c55e", "#f59e0b"];
                          return (
                            <Bar
                              key={year}
                              dataKey={year}
                              name={`Año ${year}`}
                              fill={colors[idx % colors.length]}
                              radius={[6, 6, 0, 0]}
                            />
                          );
                        })}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="report-section">
            <div className="report-header">
              <div>
                <h3>Generar Reporte Personalizado</h3>
                <p>
                  Crea reportes detallados filtrando por fecha, estado, producto
                  y más
                </p>
              </div>
            </div>

            <div className="report-filters-container">
              <h4>Filtros de búsqueda</h4>
              <div className="filters-row">
                <div className="filter-group">
                  <label>Estado</label>
                  <div className="custom-dropdown">
                    <div
                      className="dropdown-header"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "estado" ? null : "estado"
                        )
                      }
                    >
                      <span>
                        {selectedEstados.length > 0
                          ? `${selectedEstados.length} seleccionado(s)`
                          : "Seleccionar..."}
                      </span>
                      <span className="dropdown-arrow">
                        {openDropdown === "estado" ? "▲" : "▼"}
                      </span>
                    </div>
                    {openDropdown === "estado" && (
                      <div className="dropdown-menu">
                        {estadosReclamo.map((estado) => (
                          <label key={estado.id} className="dropdown-option">
                            <input
                              type="checkbox"
                              checked={selectedEstados.includes(estado.id)}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setSelectedEstados([
                                    ...selectedEstados,
                                    estado.id,
                                  ]);
                                else
                                  setSelectedEstados(
                                    selectedEstados.filter(
                                      (s) => s !== estado.id
                                    )
                                  );
                              }}
                            />
                            <span>{estado.nombre}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Producto</label>
                  <div className="custom-dropdown">
                    <div
                      className="dropdown-header"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "producto" ? null : "producto"
                        )
                      }
                    >
                      <span>
                        {selectedProductos.length > 0
                          ? `${selectedProductos.length} seleccionado(s)`
                          : "Seleccionar..."}
                      </span>
                      <span className="dropdown-arrow">
                        {openDropdown === "producto" ? "▲" : "▼"}
                      </span>
                    </div>
                    {openDropdown === "producto" && (
                      <div className="dropdown-menu">
                        {productos.map((prod) => (
                          <label key={prod.id} className="dropdown-option">
                            <input
                              type="checkbox"
                              checked={selectedProductos.includes(prod.id)}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setSelectedProductos([
                                    ...selectedProductos,
                                    prod.id,
                                  ]);
                                else
                                  setSelectedProductos(
                                    selectedProductos.filter(
                                      (p) => p !== prod.id
                                    )
                                  );
                              }}
                            />
                            <span>{prod.nombre}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Área Responsable</label>
                  <div className="custom-dropdown">
                    <div
                      className="dropdown-header"
                      onClick={() =>
                        setOpenDropdown(openDropdown === "area" ? null : "area")
                      }
                    >
                      <span>
                        {selectedAreas.length > 0
                          ? `${selectedAreas.length} seleccionado(s)`
                          : "Seleccionar..."}
                      </span>
                      <span className="dropdown-arrow">
                        {openDropdown === "area" ? "▲" : "▼"}
                      </span>
                    </div>
                    {openDropdown === "area" && (
                      <div className="dropdown-menu">
                        {areas.map((area) => (
                          <label key={area.id} className="dropdown-option">
                            <input
                              type="checkbox"
                              checked={selectedAreas.includes(area.id)}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setSelectedAreas([...selectedAreas, area.id]);
                                else
                                  setSelectedAreas(
                                    selectedAreas.filter((a) => a !== area.id)
                                  );
                              }}
                            />
                            <span>{area.nombre}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Calificación</label>
                  <div className="filter-select-wrap">
                    <Select
                      options={[
                        { value: "", label: "Todas" },
                        { value: "justificado", label: "Justificado" },
                        { value: "no_justificado", label: "No Justificado" },
                        { value: "incertidumbre", label: "Incertidumbre" },
                      ]}
                      value={
                        selectedCalificacion
                          ? {
                              value: selectedCalificacion,
                              label:
                                selectedCalificacion === "justificado"
                                  ? "Justificado"
                                  : selectedCalificacion === "no_justificado"
                                  ? "No Justificado"
                                  : "Incertidumbre",
                            }
                          : { value: "", label: "Todas" }
                      }
                      onChange={(option) =>
                        setSelectedCalificacion(option.value)
                      }
                      classNamePrefix="react-select"
                      isClearable={false}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Cumplimiento</label>
                  <div className="filter-select-wrap">
                    <Select
                      options={[
                        { value: "", label: "Todos" },
                        { value: "cumple", label: "Cumple" },
                        { value: "no_cumple", label: "No Cumple" },
                      ]}
                      value={
                        selectedCumplimiento
                          ? {
                              value: selectedCumplimiento,
                              label:
                                selectedCumplimiento === "cumple"
                                  ? "Cumple"
                                  : "No Cumple",
                            }
                          : { value: "", label: "Todos" }
                      }
                      onChange={(option) =>
                        setSelectedCumplimiento(option.value)
                      }
                      classNamePrefix="react-select"
                      isClearable={false}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Fecha Desde</label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="filter-date-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Fecha Hasta</label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="filter-date-input"
                  />
                </div>
              </div>

              <div className="report-actions">
                <button
                  className="btn-generate-report"
                  onClick={handleGenerarReporte}
                >
                  <FileBarChart size={18} />
                  <span>Generar Reporte</span>
                </button>
                <button
                  className="btn-clear-filters"
                  type="button"
                  onClick={() => {
                    setSelectedEstados([]);
                    setSelectedProductos([]);
                    setSelectedAreas([]);
                    setSelectedCalificacion("");
                    setSelectedCumplimiento("");
                    setFechaDesde("");
                    setFechaHasta("");
                    setShowResults(false);
                  }}
                >
                  <RotateCcw size={16} />
                  Limpiar Filtro
                </button>
              </div>
            </div>
          </div>

          {showResults && (
            <div className="report-results" id="report-results">
              <div className="results-header">
                <h3>Resultados del Reporte</h3>
                <p>
                  {reclamosFiltrados.length} reclamo
                  {reclamosFiltrados.length !== 1 ? "s" : ""} encontrado
                  {reclamosFiltrados.length !== 1 ? "s" : ""}
                </p>
                <p>Selecciona un registro para ver los detalles</p>
              </div>
              <div className="results-table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Estado</th>
                      <th>Producto</th>
                      <th>Cliente</th>
                      <th>Descripción</th>
                      <th>Asesor</th>
                      <th>Área Responsable</th>
                      <th>Fecha Creación</th>
                      <th>Fecha Límite</th>
                      <th>Cumplimiento</th>
                      <th>Calificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reclamosFiltrados.length > 0 ? (
                      reclamosFiltrados.map((r) => (
                        <tr
                          key={r.id}
                          className="clickable-row"
                          onClick={() => setSelectedReclamo(r)}
                          title="Ver detalle de reclamo"
                        >
                          <td>{r.id}</td>
                          <td>
                            <span
                              className={`badge ${getEstadoBadgeClass(
                                r.estado_id
                              )}`}
                            >
                              {getEstadoNombre(r.estado_id)}
                            </span>
                          </td>
                          <td>{getProductoNombre(r.producto_id)}</td>
                          <td>{r.cliente || "N/A"}</td>
                          <td>{r.descripcion_caso || "Sin descripción"}</td>
                          <td>{r.asesor || "N/A"}</td>
                          <td>{getAreaNombre(r.proceso_responsable)}</td>
                          <td>
                            {r.fecha_creacion
                              ? fmtDate(r.fecha_creacion)
                              : "N/A"}
                          </td>
                          <td>
                            {r.fecha_limite_teorico
                              ? fmtDate(r.fecha_limite_teorico)
                              : "N/A"}
                          </td>
                          <td>
                            {r.cumplimiento !== null &&
                            r.cumplimiento !== undefined ? (
                              <span
                                className={`badge ${
                                  r.cumplimiento
                                    ? "badge-success"
                                    : "badge-danger"
                                }`}
                              >
                                {r.cumplimiento ? (
                                  <>
                                    <FaCheck /> Cumple
                                  </>
                                ) : (
                                  <>
                                    <FaXmark /> No cumple
                                  </>
                                )}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td>
                            {r.justificado ? (
                              <span className="badge badge-success">
                                Justificado
                              </span>
                            ) : r.no_justificado ? (
                              <span className="badge badge-danger">
                                No Justificado
                              </span>
                            ) : r.incertidumbre ? (
                              <span className="badge badge-warning">
                                Incertidumbre
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="no-results">
                          No se encontraron reclamos con los filtros
                          seleccionados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {selectedReclamo && (
        <InvoiceForm
          onClose={() => setSelectedReclamo(null)}
          onFinish={() => setSelectedReclamo(null)}
          reclamoData={selectedReclamo}
          isViewOnly={true}
        />
      )}
    </div>
  );
}

export default Reportes;
