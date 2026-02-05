// Configuración de permisos por rol
const ROLE_PERMISSIONS = {
  administrador: [
    "/dashboard",
    "/usuarios",
    "/reclamos",
    "/reportes",
    "/productos",
    "/matrices",
    "/config",
    "/area",
    "/auditoria",
    "/cambiar-contrasena",
  ],
  reclamos: ["/dashboard", "/reclamos", "/reportes"],
  "Lider Reclamos": [
    "/dashboard",
    "/reclamos",
    "/reportes",
    "/auditoria",
    "/cambiar-contrasena",
  ],
  "lider Reclamos": [
    "/dashboard",
    "/reclamos",
    "/reportes",
    "/auditoria",
    "/cambiar-contrasena",
  ],
  "lider reclamos": [
    "/dashboard",
    "/reclamos",
    "/reportes",
    "/auditoria",
    "/cambiar-contrasena",
  ],
  colaborador: ["/dashboard", "/reclamos", "/reportes", "/cambiar-contrasena"],
  auditor: [
    "/dashboard",
    "/reclamos",
    "/reportes",
    "/auditoria",
    "/cambiar-contrasena",
  ],
};

export const getPermittedRoutes = (rol) => {
  return ROLE_PERMISSIONS[rol] || [];
};

export const hasAccess = (rol, path) => {
  // Administrador tiene acceso a todo
  if (rol === "administrador") {
    return true;
  }
  const permittedRoutes = getPermittedRoutes(rol);
  return permittedRoutes.includes(path);
};

export const canEditReclaimos = (rol) => {
  return rol === "administrador" || rol === "reclamos";
};

export const isColaborador = (rol) => {
  return rol === "colaborador";
};

export const isAuditor = (rol) => {
  return rol === "auditor";
};

export const isLiderReclamos = (rol) => {
  return (
    rol === "Lider Reclamos" ||
    rol === "lider Reclamos" ||
    rol === "lider reclamos"
  );
};

export const isReadOnlyRole = (rol) => {
  return rol === "colaborador" || rol === "auditor";
};

export const canApproveReclaims = (rol) => {
  return (
    rol === "administrador" ||
    rol === "Lider Reclamos" ||
    rol === "lider Reclamos" ||
    rol === "lider reclamos"
  );
};
