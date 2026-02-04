import express from "express";
import EstadosReclamoController from "../controllers/estadosReclamoController.js";

const router = express.Router();

router.get("/", EstadosReclamoController.getAll);
router.get("/:id", EstadosReclamoController.getById);
router.post("/", EstadosReclamoController.create);
router.put("/:id", EstadosReclamoController.update);
router.delete("/:id", EstadosReclamoController.delete);

export default router;
