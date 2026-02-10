"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { authFetch } from "../utils/authFetch";
import "./Auditoria.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [logsRes, usersRes] = await Promise.all([
        authFetch(`${API_BASE}/registros`),
        authFetch(`${API_BASE}/usuarios`),
      ]);

      const logsJson = await logsRes.json();
      const usersJson = await usersRes.json();

      if (!logsRes.ok) {
        throw new Error(
          logsJson.message || "No se pudieron cargar los registros"
        );
      }
      if (!usersRes.ok) {
        throw new Error(
          usersJson.message || "No se pudieron cargar los usuarios"
        );
      }

      setLogs(Array.isArray(logsJson.data) ? logsJson.data : []);
      setUsuarios(Array.isArray(usersJson.data) ? usersJson.data : []);
    } catch (e) {
      setError(e.message || "Error al cargar la auditoría");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const usuariosMap = useMemo(() => {
    const map = new Map();
    usuarios.forEach((u) => {
      map.set(u.id, u.nombre || u.username || "Usuario");
    });
    return map;
  }, [usuarios]);

  const fmtFecha = (fecha) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-CO");
  };

  const filteredLogs = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((log) => {
      const accion = (log.accion || "").toLowerCase();
      const obs = (log.observacion || "").toLowerCase();
      const usuarioNombre = (
        usuariosMap.get(log.usuario_id) || ""
      ).toLowerCase();
      return (
        accion.includes(term) ||
        obs.includes(term) ||
        usuarioNombre.includes(term) ||
        String(log.formulario_id || "").includes(term)
      );
    });
  }, [filter, logs, usuariosMap]);

  return (
    <div className="auditoria-page">
      <div className="auditoria-header">
        <div>
          <h2>Auditoría</h2>
          <p>Bitácora de acciones realizadas en el sistema</p>
        </div>
        <div className="auditoria-controls">
          <button
            className="auditoria-refresh"
            onClick={fetchData}
            disabled={loading}
          >
            <FiRefreshCw size={16} />
            <span>{loading ? "Actualizando..." : "Actualizar"}</span>
          </button>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por usuario, acción u observación"
            className="auditoria-search"
          />
        </div>
      </div>

      <div className="auditoria-card">
        {error && <div className="auditoria-error">{error}</div>}
        {loading ? (
          <div className="auditoria-loading">Cargando registros...</div>
        ) : (
          <div className="auditoria-table-wrapper">
            <table className="auditoria-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Observación</th>
                  <th>Reclamo</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Sin registros para mostrar
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{fmtFecha(log.fecha)}</td>
                      <td>{usuariosMap.get(log.usuario_id) || "—"}</td>
                      <td>{log.accion || "—"}</td>
                      <td>{log.observacion || "—"}</td>
                      <td>
                        {log.formulario_id ? `#${log.formulario_id}` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Auditoria;
