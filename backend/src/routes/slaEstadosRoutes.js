import express from "express";
import SlaEstadosController from "../controllers/slaEstadosController.js";

const router = express.Router();

router.get("/", SlaEstadosController.getAll);
router.get("/:id", SlaEstadosController.getById);
router.post("/", SlaEstadosController.create);
router.put("/:id", SlaEstadosController.update);
router.delete("/:id", SlaEstadosController.delete);

export default router;
