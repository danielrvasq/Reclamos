"use client";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiClipboard,
  FiUsers,
  FiBarChart2,
  FiBox,
  FiGrid,
  FiShield,
  FiSettings,
} from "react-icons/fi";
import { getPermittedRoutes } from "../utils/rolePermissions";
import "./Layout.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [permittedRoutes, setPermittedRoutes] = useState([]);

  useEffect(() => {
    // Obtener rol del usuario y cargar permisos
    const usuarioJson = localStorage.getItem("usuario");
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        const rol = usuario.rol || usuario.rol_nombre;
        setPermittedRoutes(getPermittedRoutes(rol));
      } catch (error) {
        console.error("Error al cargar permisos:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Cerrar menú al navegar
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Cerrar menú al hacer clic fuera (solo en móvil)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        !event.target.closest(".layout-sidebar") &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      // Usar timeout para evitar que se cierre inmediatamente
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isMobileMenuOpen]);

  // Prevenir scroll del body cuando el menú está abierto en móvil
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="layout-container">
      {/* Botón hamburguesa para móvil */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay para cerrar el menú en móvil */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`layout-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <img src="/Plomada-03.ico" alt="RadicApp" className="sidebar-logo" />
          <span className="sidebar-title">Reclamos</span>
        </div>

        <nav className="sidebar-nav" aria-label="Secciones">
          {permittedRoutes.includes("/dashboard") && (
            <button
              className={`nav-item ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/dashboard")}
            >
              <FiHome className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Inicio</span>
            </button>
          )}

          {permittedRoutes.includes("/reclamos") && (
            <button
              className={`nav-item ${
                location.pathname === "/reclamos" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/reclamos")}
            >
              <FiClipboard className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Reclamos</span>
            </button>
          )}

          {permittedRoutes.includes("/usuarios") && (
            <button
              className={`nav-item ${
                location.pathname === "/usuarios" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/usuarios")}
            >
              <FiUsers className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Usuarios</span>
            </button>
          )}

          {permittedRoutes.includes("/reportes") && (
            <button
              className={`nav-item ${
                location.pathname === "/reportes" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/reportes")}
            >
              <FiBarChart2 className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Reportes</span>
            </button>
          )}

          {permittedRoutes.includes("/productos") && (
            <button
              className={`nav-item ${
                location.pathname === "/productos" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/productos")}
            >
              <FiBox className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Productos</span>
            </button>
          )}

          {permittedRoutes.includes("/matrices") && (
            <button
              className={`nav-item ${
                location.pathname === "/matrices" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/matrices")}
            >
              <FiGrid className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Matrices</span>
            </button>
          )}

          {permittedRoutes.includes("/auditoria") && (
            <button
              className={`nav-item ${
                location.pathname === "/auditoria" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/auditoria")}
            >
              <FiShield className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Auditoría</span>
            </button>
          )}

          {permittedRoutes.includes("/config") && (
            <button
              className={`nav-item ${
                location.pathname === "/config" ? "active" : ""
              }`}
              onClick={() => handleNavigate("/config")}
            >
              <FiSettings className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Configuración</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <FiLogOut className="logout-icon" />
            <span className="logout-text">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="layout-main">{children}</main>
    </div>
  );
}

export default Layout;
