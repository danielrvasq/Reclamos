import express from "express";
import MatrizDireccionamientoController from "../controllers/matrizDireccionamientoController.js";

const router = express.Router();

router.get("/", MatrizDireccionamientoController.getAll);
router.get("/:id", MatrizDireccionamientoController.getById);
router.post("/", MatrizDireccionamientoController.create);
router.put("/:id", MatrizDireccionamientoController.update);
router.delete("/:id", MatrizDireccionamientoController.delete);

export default router;
