import TiposProductoModel from "../models/tiposProductoModel.js";

class TiposProductoController {
  static async getAll(req, res) {
    try {
      const items = await TiposProductoModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await TiposProductoModel.getById(id);
      if (!item) {
        return res
          .status(404)
          .json({ status: "error", message: "Tipo de producto no encontrado" });
      }
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, activo } = req.body;

      if (!nombre) {
        return res
          .status(400)
          .json({ status: "error", message: "El nombre es requerido" });
      }

      const newItem = await TiposProductoModel.create({
        nombre,
        activo: typeof activo === "boolean" ? activo : true,
      });

      res.status(201).json({
        status: "success",
        message: "Tipo de producto creado",
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

      if (!nombre) {
        return res
          .status(400)
          .json({ status: "error", message: "El nombre es requerido" });
      }

      const exists = await TiposProductoModel.getById(id);
      if (!exists) {
        return res
          .status(404)
          .json({ status: "error", message: "Tipo de producto no encontrado" });
      }

      const updated = await TiposProductoModel.update(id, {
        nombre,
        activo: typeof activo === "boolean" ? activo : exists.activo,
      });

      res.json({
        status: "success",
        message: "Tipo de producto actualizado",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await TiposProductoModel.getById(id);
      if (!exists) {
        return res
          .status(404)
          .json({ status: "error", message: "Tipo de producto no encontrado" });
      }

      const result = await TiposProductoModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default TiposProductoController;
