import express from "express";
import UsuarioRolesController from "../controllers/usuarioRolesController.js";

const router = express.Router();

// Rutas para usuario_roles
router.get("/", UsuarioRolesController.getAllUserRoles);
router.get("/:id", UsuarioRolesController.getUserRoleById);
router.get("/usuario/:usuarioId", UsuarioRolesController.getRolesByUserId);
router.get("/rol/:rolId", UsuarioRolesController.getUsersByRoleId);
router.post("/", UsuarioRolesController.createUserRole);
router.put("/:id", UsuarioRolesController.updateUserRole);
router.delete("/:id", UsuarioRolesController.deleteUserRole);
router.delete(
  "/usuario/:usuarioId/all",
  UsuarioRolesController.deleteAllRolesByUserId
);

export default router;
