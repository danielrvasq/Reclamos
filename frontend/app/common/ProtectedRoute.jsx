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

      console.log("DEBUG ProtectedRoute:", {
        usuarioCompleto: usuario,
        rolDetectado: rol,
        currentPath,
        tieneAcceso: hasAccess(rol, currentPath),
      });

      if (!hasAccess(rol, currentPath)) {
        // Usuario no tiene permiso para esta ruta
        console.warn(`Usuario con rol ${rol} intenta acceder a ${currentPath}`);
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
