import "./Config.css";
import { useState } from "react";
import {
  FiList,
  FiEdit,
  FiTag,
  FiLayers,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { FiBriefcase } from "react-icons/fi";
import CausasManager from "./causas/CausasManager";
import ClasificacionesManager from "./clasificaciones/ClasificacionesManager";
import ClasesManager from "./clases/ClasesManager";
import EstadosReclamoManager from "./estadosReclamo/EstadosReclamoManager";
import SlaEstadosManager from "./slaEstados/SlaEstadosManager";
import AreasManager from "./areas/AreasManager";

function Config() {
  const [showCausasManager, setShowCausasManager] = useState(false);
  const [showClasificacionesManager, setShowClasificacionesManager] =
    useState(false);
  const [showClasesManager, setShowClasesManager] = useState(false);
  const [showEstadosReclamoManager, setShowEstadosReclamoManager] =
    useState(false);
  const [showSlaEstadosManager, setShowSlaEstadosManager] = useState(false);
  const [showAreasManager, setShowAreasManager] = useState(false);

  return (
    <>
      <div className="config-content">
        <div className="config-header">
          <h2>Configuración</h2>
          <p>Gestiona los contenidos de las tablas base de datos</p>
        </div>

        <div className="config-grid">
          {/* Card Áreas */}
          <div className="config-card">
            <div className="card-icon">
              <FiBriefcase />
            </div>
            <h3>Áreas</h3>
            <p>Administra las áreas de la organización y sus responsables.</p>
            <button
              className="card-button"
              onClick={() => setShowAreasManager(true)}
            >
              <FiEdit size={16} />
              <span>Gestionar</span>
            </button>
          </div>

          {/* Card Clasificaciones Matriz */}
          <div className="config-card">
            <div className="card-icon">
              <FiTag />
            </div>
            <h3>Clasificaciones Matriz</h3>
            <p>
              Administra las clasificaciones de la matriz de direccionamiento.
            </p>
            <button
              className="card-button"
              onClick={() => setShowClasificacionesManager(true)}
            >
              <FiEdit size={16} />
              <span>Gestionar</span>
            </button>
          </div>

          {/* Card Clases Matriz */}
          <div className="config-card">
            <div className="card-icon">
              <FiLayers />
            </div>
            <h3>Clases Matriz</h3>
            <p>
              Administra las clases asociadas a clasificaciones en la matriz.
            </p>
            <button
              className="card-button"
              onClick={() => setShowClasesManager(true)}
            >
              <FiEdit size={16} />
              <span>Gestionar</span>
            </button>
          </div>

          {/* Card Causas Matriz */}
          <div className="config-card">
            <div className="card-icon">
              <FiList />
            </div>
            <h3>Causas Matriz</h3>
            <p>
              Administra las causas de los reclamos en la matriz de
              direccionamiento.
            </p>
            <button
              className="card-button"
              onClick={() => setShowCausasManager(true)}
            >
              <FiEdit size={16} />
              <span>Gestionar</span>
            </button>
          </div>

        </div>
      </div>

      {showClasificacionesManager && (
        <ClasificacionesManager
          onClose={() => setShowClasificacionesManager(false)}
          onRefresh={() => {}}
        />
      )}

      {showClasesManager && (
        <ClasesManager
          onClose={() => setShowClasesManager(false)}
          onRefresh={() => {}}
        />
      )}

      {showCausasManager && (
        <CausasManager
          onClose={() => setShowCausasManager(false)}
          onRefresh={() => {}}
        />
      )}

      {showEstadosReclamoManager && (
        <EstadosReclamoManager
          onClose={() => setShowEstadosReclamoManager(false)}
          onRefresh={() => {}}
        />
      )}

      {showSlaEstadosManager && (
        <SlaEstadosManager
          onClose={() => setShowSlaEstadosManager(false)}
          onRefresh={() => {}}
        />
      )}

      {showAreasManager && (
        <AreasManager
          onClose={() => setShowAreasManager(false)}
          onRefresh={() => {}}
        />
      )}
    </>
  );
}

export default Config;
