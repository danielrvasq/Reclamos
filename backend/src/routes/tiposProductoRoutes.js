import express from "express";
import TiposProductoController from "../controllers/tiposProductoController.js";

const router = express.Router();

router.get("/", TiposProductoController.getAll);
router.get("/:id", TiposProductoController.getById);
router.post("/", TiposProductoController.create);
router.put("/:id", TiposProductoController.update);
router.delete("/:id", TiposProductoController.delete);

export default router;
