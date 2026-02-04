import ClasesMatrizModel from "../models/clasesMatrizModel.js";

class ClasesMatrizController {
  static async getAll(req, res) {
    try {
      const items = await ClasesMatrizModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await ClasesMatrizModel.getById(id);
      if (!item)
        return res
          .status(404)
          .json({ status: "error", message: "Clase matriz no encontrada" });
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { clasificacion_id, nombre, activo } = req.body;

      const newItem = await ClasesMatrizModel.create({
        clasificacion_id: clasificacion_id || null,
        nombre: nombre || null,
        activo: typeof activo === "boolean" ? activo : true,
      });

      res
        .status(201)
        .json({
          status: "success",
          message: "Clase matriz creada",
          data: newItem,
        });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { clasificacion_id, nombre, activo } = req.body;

      const exists = await ClasesMatrizModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Clase matriz no encontrada" });

      const updated = await ClasesMatrizModel.update(id, {
        clasificacion_id:
          clasificacion_id !== undefined
            ? clasificacion_id
            : exists.clasificacion_id,
        nombre: nombre || null,
        activo: typeof activo === "boolean" ? activo : exists.activo,
      });

      res.json({
        status: "success",
        message: "Clase matriz actualizada",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await ClasesMatrizModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Clase matriz no encontrada" });

      const result = await ClasesMatrizModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default ClasesMatrizController;
