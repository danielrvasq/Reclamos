import express from "express";
import ClasesMatrizController from "../controllers/clasesMatrizController.js";

const router = express.Router();

router.get("/", ClasesMatrizController.getAll);
router.get("/:id", ClasesMatrizController.getById);
router.post("/", ClasesMatrizController.create);
router.put("/:id", ClasesMatrizController.update);
router.delete("/:id", ClasesMatrizController.delete);

export default router;
