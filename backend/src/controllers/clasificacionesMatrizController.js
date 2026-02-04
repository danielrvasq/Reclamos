import ClasificacionesMatrizModel from "../models/clasificacionesMatrizModel.js";

class ClasificacionesMatrizController {
  static async getAll(req, res) {
    try {
      const items = await ClasificacionesMatrizModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await ClasificacionesMatrizModel.getById(id);
      if (!item)
        return res
          .status(404)
          .json({
            status: "error",
            message: "Clasificacion matriz no encontrada",
          });
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, activo } = req.body;

      const newItem = await ClasificacionesMatrizModel.create({
        nombre: nombre || null,
        activo: typeof activo === "boolean" ? activo : true,
      });

      res
        .status(201)
        .json({
          status: "success",
          message: "Clasificacion matriz creada",
          data: newItem,
        });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, activo } = req.body;

      const exists = await ClasificacionesMatrizModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({
            status: "error",
            message: "Clasificacion matriz no encontrada",
          });

      const updated = await ClasificacionesMatrizModel.update(id, {
        nombre: nombre || null,
        activo: typeof activo === "boolean" ? activo : exists.activo,
      });

      res.json({
        status: "success",
        message: "Clasificacion matriz actualizada",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await ClasificacionesMatrizModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({
            status: "error",
            message: "Clasificacion matriz no encontrada",
          });

      const result = await ClasificacionesMatrizModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default ClasificacionesMatrizController;
