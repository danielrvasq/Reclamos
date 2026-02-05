// Middleware para validar rol "lider Reclamos" o "administrador"
export const requireApprovalRole = (req, res, next) => {
  const usuario = req.usuario;

  if (!usuario) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  const roles = (usuario.roles || []).map((r) => r.toLowerCase());
  const tienePermisos =
    roles.includes("administrador") ||
    roles.includes("lider reclamos") ||
    roles.includes("lider reclamo") ||
    roles.includes("lider de reclamos");

  if (!tienePermisos) {
    return res.status(403).json({
      message:
        "No tienes permisos para realizar esta acción. Se requiere rol de líder de reclamos o administrador",
    });
  }

  next();
};

export default requireApprovalRole;
