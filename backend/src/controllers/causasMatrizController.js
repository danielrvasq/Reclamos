import CausasMatrizModel from "../models/causasMatrizModel.js";

class CausasMatrizController {
  static async getAll(req, res) {
    try {
      const items = await CausasMatrizModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await CausasMatrizModel.getById(id);
      if (!item)
        return res
          .status(404)
          .json({ status: "error", message: "Causa matriz no encontrada" });
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { clase_id, nombre, activo } = req.body;

      const newItem = await CausasMatrizModel.create({
        clase_id: clase_id || null,
        nombre: nombre || null,
        activo: typeof activo === "boolean" ? activo : true,
      });

      res
        .status(201)
        .json({
          status: "success",
          message: "Causa matriz creada",
          data: newItem,
        });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { clase_id, nombre, activo } = req.body;

      const exists = await CausasMatrizModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Causa matriz no encontrada" });

      const updated = await CausasMatrizModel.update(id, {
        clase_id: clase_id !== undefined ? clase_id : exists.clase_id,
        nombre: nombre || null,
        activo: typeof activo === "boolean" ? activo : exists.activo,
      });

      res.json({
        status: "success",
        message: "Causa matriz actualizada",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await CausasMatrizModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Causa matriz no encontrada" });

      const result = await CausasMatrizModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default CausasMatrizController;
