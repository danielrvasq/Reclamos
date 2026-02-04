// Middleware para validar rol "lider Reclamos" o "administrador"
export const requireApprovalRole = (req, res, next) => {
  const usuario = req.usuario;

  if (!usuario) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  const roles = usuario.roles || [];
  const tienePermisos =
    roles.includes("administrador") || roles.includes("lider Reclamos");

  if (!tienePermisos) {
    return res.status(403).json({
      message:
        "No tienes permisos para realizar esta acción. Se requiere rol 'lider Reclamos' o 'administrador'",
    });
  }

  next();
};

export default requireApprovalRole;
