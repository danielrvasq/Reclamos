import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import FormulariosController from "../controllers/formulariosController.js";
import requireApprovalRole from "../middleware/roleMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads", "reclamos");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .slice(0, 60);
    const id = req.params?.id || "reclamo";
    cb(null, `carta_${id}_${Date.now()}_${safeName}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".docx") {
      return cb(new Error("Solo se permiten archivos .docx"));
    }
    return cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.get("/", FormulariosController.getAll);
router.get("/proximos-vencer", FormulariosController.getProximosVencer);
router.get("/:id/carta-preview", FormulariosController.getCartaPreview);
router.get("/:id/carta-descarga", FormulariosController.descargarCarta);
router.post(
  "/:id/solucion-final",
  upload.single("carta"),
  FormulariosController.registrarSolucionFinalConAdjunto
);
router.get("/:id", FormulariosController.getById);
router.post("/", FormulariosController.create);
router.post(
  "/notificar-proximos-vencer",
  FormulariosController.notificarProximosVencer
);
router.put("/:id", FormulariosController.update);
router.delete("/:id", requireApprovalRole, FormulariosController.delete);
router.post("/:id/aprobar", requireApprovalRole, FormulariosController.aprobar);
router.post(
  "/:id/rechazar",
  requireApprovalRole,
  FormulariosController.rechazar
);

export default router;
