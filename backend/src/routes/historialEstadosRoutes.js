import express from "express";
import HistorialEstadosController from "../controllers/historialEstadosController.js";

const router = express.Router();

router.get("/", HistorialEstadosController.getAll);
router.get("/:id", HistorialEstadosController.getById);
router.post("/", HistorialEstadosController.create);
router.put("/:id", HistorialEstadosController.update);
router.delete("/:id", HistorialEstadosController.delete);

export default router;
