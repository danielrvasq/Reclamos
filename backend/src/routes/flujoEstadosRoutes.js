import express from "express";
import FlujoEstadosController from "../controllers/flujoEstadosController.js";

const router = express.Router();

router.get("/", FlujoEstadosController.getAll);
router.get("/:id", FlujoEstadosController.getById);
router.post("/", FlujoEstadosController.create);
router.put("/:id", FlujoEstadosController.update);
router.delete("/:id", FlujoEstadosController.delete);

export default router;
