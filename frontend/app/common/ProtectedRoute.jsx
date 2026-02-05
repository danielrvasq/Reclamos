"use client";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { hasAccess } from "../utils/rolePermissions";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioJson = localStorage.getItem("usuario");

    if (!token) {
      // No hay sesión iniciada
      navigate("/", { replace: true });
      return;
    }

    // Verificar permisos del rol
    try {
      const usuario = JSON.parse(usuarioJson);
      const rol = usuario.rol_nombre || usuario.rol || "usuario"; // Usar rol_nombre primero
      const currentPath = location.pathname;

      if (
        usuario.force_password_change &&
        currentPath !== "/cambiar-contrasena"
      ) {
        navigate("/cambiar-contrasena", { replace: true });
        return;
      }

      if (currentPath === "/cambiar-contrasena") {
        setIsChecking(false);
        return;
      }

      if (!hasAccess(rol, currentPath)) {
        // Usuario no tiene permiso para esta ruta
        console.warn(
          `Usuario con rol "${rol}" intenta acceder a ${currentPath}`
        );

        // Si ya está intentando acceder a dashboard y no tiene permiso, ir a una ruta de error
        if (currentPath === "/dashboard") {
          console.error("Usuario sin permisos para dashboard, cerrando sesión");
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/", { replace: true });
          return;
        }

        // Redirigir a dashboard (página por defecto)
        navigate("/dashboard", { replace: true });
        return;
      }

      setIsChecking(false);
    } catch (error) {
      console.error("Error al verificar permisos:", error);
      navigate("/", { replace: true });
    }
  }, [navigate, location.pathname]);

  // Mostrar nada mientras verifica
  if (isChecking) {
    return null;
  }

  return children;
}
