import express from "express";
import RegistrosController from "../controllers/registrosController.js";

const router = express.Router();

router.get("/", RegistrosController.getAll);
router.get("/:id", RegistrosController.getById);
router.post("/", RegistrosController.create);
router.put("/:id", RegistrosController.update);
router.delete("/:id", RegistrosController.delete);

export default router;
