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
  ],
  reclamos: ["/dashboard", "/reclamos", "/reportes"],
  "lider Reclamos": ["/dashboard", "/reclamos", "/reportes", "/auditoria"],
  colaborador: ["/dashboard", "/reclamos", "/reportes"],
  auditor: ["/dashboard", "/reclamos", "/reportes"],
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
  return rol === "lider Reclamos";
};

export const isReadOnlyRole = (rol) => {
  return rol === "colaborador" || rol === "auditor";
};

export const canApproveReclaims = (rol) => {
  return rol === "administrador" || rol === "lider Reclamos";
};
