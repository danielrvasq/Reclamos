import express from "express";
import CausasMatrizController from "../controllers/causasMatrizController.js";

const router = express.Router();

router.get("/", CausasMatrizController.getAll);
router.get("/:id", CausasMatrizController.getById);
router.post("/", CausasMatrizController.create);
router.put("/:id", CausasMatrizController.update);
router.delete("/:id", CausasMatrizController.delete);

export default router;
