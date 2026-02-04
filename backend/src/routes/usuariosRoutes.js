import express from "express";
import UsuariosController from "../controllers/usuariosController.js";

const router = express.Router();

router.get("/", UsuariosController.getAllUsers);
router.get("/:id", UsuariosController.getUserById);
router.post("/", UsuariosController.createUser);
router.put("/:id", UsuariosController.updateUser);
router.delete("/:id", UsuariosController.deleteUser);

export default router;
