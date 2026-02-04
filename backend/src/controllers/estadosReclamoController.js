import EstadosReclamoModel from "../models/estadosReclamoModel.js";

class EstadosReclamoController {
  static async getAll(req, res) {
    try {
      const items = await EstadosReclamoModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await EstadosReclamoModel.getById(id);
      if (!item)
        return res
          .status(404)
          .json({ status: "error", message: "Estado reclamo no encontrado" });
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { codigo, nombre, descripcion, orden, es_final, color, activo } =
        req.body;

      if (!nombre) {
        return res
          .status(400)
          .json({ status: "error", message: "nombre es requerido" });
      }

      const newItem = await EstadosReclamoModel.create({
        codigo: codigo || null,
        nombre,
        descripcion: descripcion || null,
        orden: orden || null,
        es_final: typeof es_final === "boolean" ? es_final : false,
        color: parseInt(color) || 1,
        activo: typeof activo === "boolean" ? activo : true,
      });

      res.status(201).json({
        status: "success",
        message: "Estado reclamo creado",
        data: newItem,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { codigo, nombre, descripcion, orden, es_final, color, activo } =
        req.body;

      if (!nombre) {
        return res
          .status(400)
          .json({ status: "error", message: "nombre es requerido" });
      }

      const exists = await EstadosReclamoModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Estado reclamo no encontrado" });

      const updated = await EstadosReclamoModel.update(id, {
        codigo: codigo || null,
        nombre,
        descripcion: descripcion || null,
        orden: orden || null,
        es_final: typeof es_final === "boolean" ? es_final : exists.es_final,
        color: color !== undefined ? parseInt(color) : exists.color,
        activo: typeof activo === "boolean" ? activo : exists.activo,
      });

      res.json({
        status: "success",
        message: "Estado reclamo actualizado",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await EstadosReclamoModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Estado reclamo no encontrado" });

      const result = await EstadosReclamoModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default EstadosReclamoController;
