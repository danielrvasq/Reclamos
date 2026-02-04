"use client";
import { Edit2, Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import "./MatrixList.css";
import { authFetch } from "../utils/authFetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function MatrixList({
  product,
  matrices,
  onClose,
  onEdit,
  onDelete,
  onAddNew,
}) {
  const [clasificaciones, setClasificaciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [causas, setCausas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetchTaxonomyData();
  }, []);

  const fetchTaxonomyData = async () => {
    try {
      const [clasiRes, claseRes, causaRes, usuariosRes] = await Promise.all([
        authFetch(`${API_BASE}/clasificaciones-matriz`),
        authFetch(`${API_BASE}/clases-matriz`),
        authFetch(`${API_BASE}/causas-matriz`),
        authFetch(`${API_BASE}/usuarios`),
      ]);

      const clasiJson = await clasiRes.json();
      if (clasiRes.ok) setClasificaciones(clasiJson.data || []);

      const claseJson = await claseRes.json();
      if (claseRes.ok) setClases(claseJson.data || []);

      const causaJson = await causaRes.json();
      if (causaRes.ok) setCausas(causaJson.data || []);

      const usuariosJson = await usuariosRes.json();
      if (usuariosRes.ok) setUsuarios(usuariosJson.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const getClasificacionName = (id) => {
    return clasificaciones.find((c) => c.id === id)?.nombre || "N/A";
  };

  const getClaseName = (id) => {
    return clases.find((c) => c.id === id)?.nombre || "N/A";
  };

  const getCausaName = (id) => {
    return causas.find((c) => c.id === id)?.nombre || "N/A";
  };

  const getUsuarioNombre = (id) => {
    if (!id) return "—";
    return usuarios.find((u) => u.id === id)?.nombre || id;
  };

  // Filtrar solo las matrices del producto actual
  const matricesDelProducto = matrices.filter(
    (m) => m.producto_id === product?.id
  );

  // Agrupar matrices por clasificación y clase
  const groupedMatrices = matricesDelProducto.reduce((acc, matrix) => {
    const clasificacionId = matrix.clasificacion_id;
    const claseId = matrix.clase_id;

    if (!acc[clasificacionId]) {
      acc[clasificacionId] = {};
    }
    if (!acc[clasificacionId][claseId]) {
      acc[clasificacionId][claseId] = [];
    }
    acc[clasificacionId][claseId].push(matrix);
    return acc;
  }, {});

  return (
    <div className="matrix-list-overlay">
      <div className="matrix-list-modal">
        <div className="matrix-list-header">
          <div>
            <p className="matrix-list-subtitle">Matrices del producto</p>
            <h3>{product?.nombre || product}</h3>
          </div>
          <button className="close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="matrix-list-content">
          {matricesDelProducto.length === 0 ? (
            <div className="empty-state">
              <p>No hay matrices definidas para este producto</p>
              <button className="btn-primary" onClick={onAddNew}>
                <Plus size={16} />
                Crear matriz
              </button>
            </div>
          ) : (
            <div className="matrix-tree">
              {Object.entries(groupedMatrices).map(
                ([clasificacionId, claseGroups]) => (
                  <div key={clasificacionId} className="classification-group">
                    <h4 className="classification-name">
                      {getClasificacionName(parseInt(clasificacionId))}
                    </h4>

                    {Object.entries(claseGroups).map(
                      ([claseId, matrixList]) => (
                        <div
                          key={`${clasificacionId}-${claseId}`}
                          className="class-group"
                        >
                          <h5 className="class-name">
                            {getClaseName(parseInt(claseId))}
                          </h5>

                          <div className="cause-items">
                            {matrixList.map((matrix) => (
                              <div key={matrix.id} className="matrix-item">
                                <div className="matrix-item-content">
                                  <span className="cause-name">
                                    {getCausaName(matrix.causa_id)}
                                  </span>
                                  <span className="matrix-meta">
                                    Responsable:{" "}
                                    {getUsuarioNombre(
                                      matrix.responsable_tratamiento_id
                                    )}
                                  </span>
                                  <span className="matrix-meta">
                                    Respuesta:{" "}
                                    {matrix.tiempo_respuesta_dias || 0} días
                                  </span>
                                </div>
                                <div className="matrix-item-actions">
                                  <button
                                    className="action-btn edit"
                                    onClick={() => onEdit(matrix)}
                                    title="Editar"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    className="action-btn delete"
                                    onClick={() => onDelete(matrix.id)}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="matrix-list-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn-primary" onClick={onAddNew}>
            <Plus size={16} />
            Añadir matriz
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatrixList;
