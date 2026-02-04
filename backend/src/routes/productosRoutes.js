import express from "express";
import ProductosController from "../controllers/productosController.js";

const router = express.Router();

router.get("/", ProductosController.getAll);
router.get("/:id", ProductosController.getById);
router.post("/", ProductosController.create);
router.put("/:id", ProductosController.update);
router.delete("/:id", ProductosController.delete);

export default router;
