import express from "express";
import FormulariosController from "../controllers/formulariosController.js";
import requireApprovalRole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", FormulariosController.getAll);
router.get("/:id", FormulariosController.getById);
router.post("/", FormulariosController.create);
router.put("/:id", FormulariosController.update);
router.delete("/:id", FormulariosController.delete);
router.post("/:id/aprobar", requireApprovalRole, FormulariosController.aprobar);
router.post(
  "/:id/rechazar",
  requireApprovalRole,
  FormulariosController.rechazar
);

export default router;
