"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import MatrixForm from "./MatrixForm";
import Toast from "../common/Toast";
import { authFetch } from "../utils/authFetch";
import "./Matrices.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function Matrices() {
  const [matrices, setMatrices] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [causas, setCausas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [selectedMatrix, setSelectedMatrix] = useState(null);
  const [showMatrixForm, setShowMatrixForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    loadMatrices();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const loadMatrices = async () => {
    try {
      setLoading(true);

      // Cargar matriz universal (sin filtro de producto)
      const matrizRes = await authFetch(`${API_BASE}/matriz-direccionamiento`);
      const matrizJson = await matrizRes.json();
      if (matrizRes.ok) setMatrices(matrizJson.data || []);

      // Cargar catálogos para filtrado y búsqueda
      const clasRes = await authFetch(`${API_BASE}/clasificaciones-matriz`);
      const clasJson = await clasRes.json();
      if (clasRes.ok) setClasificaciones(clasJson.data || []);

      const claseRes = await authFetch(`${API_BASE}/clases-matriz`);
      const claseJson = await claseRes.json();
      if (claseRes.ok) setClases(claseJson.data || []);

      const causaRes = await authFetch(`${API_BASE}/causas-matriz`);
      const causaJson = await causaRes.json();
      if (causaRes.ok) setCausas(causaJson.data || []);

      // Cargar usuarios para resolver nombres (por si el backend no trae los alias)
      const usuariosRes = await authFetch(`${API_BASE}/usuarios`);
      const usuariosJson = await usuariosRes.json();
      if (usuariosRes.ok) setUsuarios(usuariosJson.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast("Error al cargar la matriz");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMatrix = async (matrixPayload) => {
    // NO incluir producto_id - la matriz es universal
    const payload = {
      clasificacion_id: matrixPayload.clasificacion_id,
      clase_id: matrixPayload.clase_id,
      causa_id: matrixPayload.causa_id,
      primer_contacto_ids: matrixPayload.primer_contacto_ids || [],
      tiempo_atencion_inicial_dias:
        matrixPayload.tiempo_atencion_inicial_dias ?? null,
      responsable_tratamiento_id: matrixPayload.responsable_tratamiento_id,
      tiempo_respuesta_dias: matrixPayload.tiempo_respuesta_dias ?? null,
      tipo_respuesta: matrixPayload.tipo_respuesta || null,
    };

    const isEdit = selectedMatrix?.id;
    const url = isEdit
      ? `${API_BASE}/matriz-direccionamiento/${selectedMatrix.id}`
      : `${API_BASE}/matriz-direccionamiento`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        showToast(
          json.message || `Error al ${isEdit ? "actualizar" : "crear"} matriz`
        );
        return;
      }

      setShowMatrixForm(false);
      setSelectedMatrix(null);
      await loadMatrices();
      showToast(`Matriz ${isEdit ? "actualizada" : "creada"} correctamente`);
    } catch (error) {
      console.error("Error guardando matriz:", error);
      showToast("Error al guardar la matriz");
    }
  };

  const handleDeleteMatrix = async (matrixId) => {
    if (!confirm("¿Eliminar esta combinación de la matriz?")) return;
    try {
      const res = await authFetch(
        `${API_BASE}/matriz-direccionamiento/${matrixId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await loadMatrices();
        showToast("Combinación eliminada correctamente");
      } else {
        showToast("Error al eliminar");
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      showToast("Error al eliminar");
    }
  };

  const getNombre = (id, lista) => {
    return lista.find((item) => item.id === id)?.nombre || `ID: ${id}`;
  };

  const getUsuarioNombre = (id, fallbackNombre) => {
    if (fallbackNombre) return fallbackNombre;
    return usuarios.find((u) => u.id === id)?.nombre || "—";
  };

  const getUsuarioNombres = (ids = [], fallbackNombres = []) => {
    if (Array.isArray(fallbackNombres) && fallbackNombres.length > 0) {
      return fallbackNombres.join(", ");
    }

    if (!Array.isArray(ids) || ids.length === 0) return "—";
    return ids
      .map((id) => usuarios.find((u) => u.id === id)?.nombre || `ID: ${id}`)
      .join(", ");
  };

  const normalize = (value) => (value || "").toString().toLowerCase();
  const matchesSearch = (matrix) => {
    const term = normalize(searchTerm).trim();
    if (!term) return true;
    const values = [
      getNombre(matrix.clasificacion_id, clasificaciones),
      getNombre(matrix.clase_id, clases),
      getNombre(matrix.causa_id, causas),
      getUsuarioNombres(
        matrix.primer_contacto_ids ||
          (matrix.primer_contacto_id ? [matrix.primer_contacto_id] : []),
        matrix.primer_contacto_nombres
      ),
      getUsuarioNombre(
        matrix.responsable_tratamiento_id,
        matrix.responsable_tratamiento_nombre
      ),
      matrix.tiempo_atencion_inicial_dias,
      matrix.tiempo_respuesta_dias,
      matrix.tipo_respuesta,
      matrix.id,
    ];
    return values.some((value) => normalize(value).includes(term));
  };

  const filteredMatrices = matrices.filter(matchesSearch);

  return (
    <div className="matrices-page">
      <div className="matrices-header">
        <div>
          <h2>Matriz Direccionamiento Universal</h2>
          <p>
            Gestiona el enrutamiento único que utilizan todos los productos.
          </p>
        </div>
        <div className="matrices-tools">
          <button
            type="button"
            className="action primary"
            onClick={() => {
              setSelectedMatrix(null);
              setShowMatrixForm(true);
            }}
          >
            <Plus size={16} />
            <span>Nueva Combinación</span>
          </button>
          <input
            className="search"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="matrix-loading">
          <p>Cargando matriz...</p>
        </div>
      )}

      {!loading && filteredMatrices.length === 0 && (
        <div className="matrix-empty">
          <AlertCircle size={40} />
          <p>No hay combinaciones en la matriz aún.</p>
          <button
            className="action primary"
            onClick={() => {
              setSelectedMatrix(null);
              setShowMatrixForm(true);
            }}
          >
            <Plus size={14} />
            Crear Primera Combinación
          </button>
        </div>
      )}

      {!loading && filteredMatrices.length > 0 && (
        <div className="matrix-table-container">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Clasificación</th>
                <th>Clase</th>
                <th>Causa</th>
                <th>Primer Contacto</th>
                <th>Responsable Tratamiento</th>
                <th>Tiempo Atención (d)</th>
                <th>Tiempo Respuesta (d)</th>
                <th>Tipo Respuesta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrices.map((matrix) => (
                <tr key={matrix.id}>
                  <td>{getNombre(matrix.clasificacion_id, clasificaciones)}</td>
                  <td>{getNombre(matrix.clase_id, clases)}</td>
                  <td>{getNombre(matrix.causa_id, causas)}</td>
                  <td>
                    {getUsuarioNombres(
                      matrix.primer_contacto_ids ||
                        (matrix.primer_contacto_id
                          ? [matrix.primer_contacto_id]
                          : []),
                      matrix.primer_contacto_nombres
                    )}
                  </td>
                  <td>
                    {getUsuarioNombre(
                      matrix.responsable_tratamiento_id,
                      matrix.responsable_tratamiento_nombre
                    )}
                  </td>
                  <td>{matrix.tiempo_atencion_inicial_dias ?? "—"}</td>
                  <td>{matrix.tiempo_respuesta_dias ?? "—"}</td>
                  <td>{matrix.tipo_respuesta || "—"}</td>
                  <td className="matrix-actions">
                    <button
                      className="icon-btn edit"
                      onClick={() => {
                        setSelectedMatrix(matrix);
                        setShowMatrixForm(true);
                      }}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDeleteMatrix(matrix.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showMatrixForm && (
        <MatrixForm
          initialData={selectedMatrix}
          onClose={() => {
            setShowMatrixForm(false);
            setSelectedMatrix(null);
          }}
          onFinish={handleSaveMatrix}
          clasificaciones={clasificaciones}
          clases={clases}
          causas={causas}
        />
      )}

      <Toast visible={toastVisible} message={toastMessage} type="success" />
    </div>
  );
}

export default Matrices;
