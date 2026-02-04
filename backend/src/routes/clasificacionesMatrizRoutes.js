import express from "express";
import ClasificacionesMatrizController from "../controllers/clasificacionesMatrizController.js";

const router = express.Router();

router.get("/", ClasificacionesMatrizController.getAll);
router.get("/:id", ClasificacionesMatrizController.getById);
router.post("/", ClasificacionesMatrizController.create);
router.put("/:id", ClasificacionesMatrizController.update);
router.delete("/:id", ClasificacionesMatrizController.delete);

export default router;
