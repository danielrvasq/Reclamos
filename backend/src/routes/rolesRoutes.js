import express from "express";
import RolesController from "../controllers/rolesController.js";

const router = express.Router();

// Rutas para roles
router.get("/", RolesController.getAllRoles);
router.get("/:id", RolesController.getRoleById);
router.post("/", RolesController.createRole);
router.put("/:id", RolesController.updateRole);
router.delete("/:id", RolesController.deleteRole);

export default router;
