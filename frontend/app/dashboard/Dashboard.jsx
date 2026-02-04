"use client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// Toast now centralized
import InvoiceForm from "../invoice/InvoiceForm";
import Toast from "../common/Toast";
import { getPermittedRoutes, isReadOnlyRole } from "../utils/rolePermissions";
import {
  FiPlus,
  FiFileText,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiPackage,
  FiGrid,
  FiClipboard,
  FiShield,
} from "react-icons/fi";
import { PiHandWaving } from "react-icons/pi";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [permittedRoutes, setPermittedRoutes] = useState([]);
  const [usuarioRol, setUsuarioRol] = useState(null);

  useEffect(() => {
    // Obtener rol del usuario y cargar permisos
    const usuarioJson = localStorage.getItem("usuario");
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        const rol = usuario.rol_nombre || usuario.rol;
        setUsuarioRol(rol);
        setPermittedRoutes(getPermittedRoutes(rol));
      } catch (error) {
        console.error("Error al cargar permisos:", error);
      }
    }
  }, []);

  const handleOpenInvoiceForm = () => {
    setShowInvoiceForm(true);
  };

  const handleCloseInvoiceForm = () => {
    setShowInvoiceForm(false);
  };

  const handleFinishInvoice = () => {
    setToastMessage("Nuevo reclamo creado");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <>
      <div className="dashboard-content">
        <div className="welcome-message">
          <h1>
            <span>¡Bienvenido!</span>
            <span className="wave-emoji">
              <PiHandWaving />
            </span>
          </h1>
        </div>

        <div className="dashboard-grid">
          {permittedRoutes.includes("/reclamos") &&
            !isReadOnlyRole(usuarioRol) && (
              <div className="dashboard-card">
                <div className="card-icon">
                  <FiFileText />
                </div>
                <h3>Nuevo Reclamo</h3>
                <p>Crear un nuevo reclamo</p>
                <button className="card-button" onClick={handleOpenInvoiceForm}>
                  <FiPlus size={16} />
                  <span>Crear</span>
                </button>
              </div>
            )}

          {permittedRoutes.includes("/reclamos") && (
            <div className="dashboard-card">
              <div className="card-icon">
                <FiClipboard />
              </div>
              <h3>Reclamos</h3>
              <p>Ver todos los reclamos</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="card-button"
                  onClick={() => navigate("/reclamos")}
                >
                  <FiFileText size={16} />
                  <span>Ver</span>
                </button>
              </div>
            </div>
          )}

          {permittedRoutes.includes("/usuarios") && (
            <div className="dashboard-card">
              <div className="card-icon">
                <FiUsers />
              </div>
              <h3>Usuarios</h3>
              <p>Gestionar usuarios</p>
              <button
                className="card-button"
                onClick={() => navigate("/usuarios")}
              >
                <FiUsers size={16} />
                <span>Gestionar</span>
              </button>
            </div>
          )}

          {permittedRoutes.includes("/reportes") && (
            <div className="dashboard-card">
              <div className="card-icon">
                <FiBarChart2 />
              </div>
              <h3>Reportes</h3>
              <p>Ver estadísticas y reportes</p>
              <button
                className="card-button"
                onClick={() => navigate("/reportes")}
              >
                <FiBarChart2 size={16} />
                <span>Ver</span>
              </button>
            </div>
          )}

          {permittedRoutes.includes("/productos") && (
            <div className="dashboard-card">
              <div className="card-icon">
                <FiPackage />
              </div>
              <h3>Productos</h3>
              <p>Gestionar catálogo de productos</p>
              <button
                className="card-button"
                onClick={() => navigate("/productos")}
              >
                <FiPackage size={16} />
                <span>Gestionar</span>
              </button>
            </div>
          )}

          {permittedRoutes.includes("/matrices") && (
            <div className="dashboard-card">
              <div className="card-icon">
                <FiGrid />
              </div>
              <h3>Matrices de Clasificación</h3>
              <p>Ver y administrar matrices</p>
              <button
                className="card-button"
                onClick={() => navigate("/matrices")}
              >
                <FiGrid size={16} />
                <span>Ver</span>
              </button>
            </div>
          )}

          {permittedRoutes.includes("/auditoria") && (
            <div className="dashboard-card">
              <div className="card-icon">
                <FiShield />
              </div>
              <h3>Auditoría</h3>
              <p>Ver bitácora del sistema</p>
              <button
                className="card-button"
                onClick={() => navigate("/auditoria")}
              >
                <FiShield size={16} />
                <span>Ingresar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showInvoiceForm && (
        <InvoiceForm
          onClose={handleCloseInvoiceForm}
          onFinish={handleFinishInvoice}
        />
      )}

      <Toast visible={toastVisible} message={toastMessage} type="success" />
    </>
  );
}

export default Dashboard;

