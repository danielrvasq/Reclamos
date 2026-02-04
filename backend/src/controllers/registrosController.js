import RegistrosModel from "../models/registrosModel.js";

class RegistrosController {
  static async getAll(req, res) {
    try {
      const items = await RegistrosModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await RegistrosModel.getById(id);
      if (!item)
        return res
          .status(404)
          .json({ status: "error", message: "Registro no encontrado" });
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { formulario_id, usuario_id, accion, observacion, fecha } =
        req.body;

      if (!accion) {
        return res
          .status(400)
          .json({ status: "error", message: "accion es requerida" });
      }

      const newItem = await RegistrosModel.create({
        formulario_id: formulario_id ?? null,
        usuario_id: usuario_id ?? null,
        accion,
        observacion: observacion || null,
        fecha: fecha ? new Date(fecha) : new Date(),
      });

      res
        .status(201)
        .json({ status: "success", message: "Registro creado", data: newItem });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { formulario_id, usuario_id, accion, observacion, fecha } =
        req.body;

      if (!accion) {
        return res
          .status(400)
          .json({ status: "error", message: "accion es requerida" });
      }

      const exists = await RegistrosModel.getById(id);
      if (!exists) {
        return res
          .status(404)
          .json({ status: "error", message: "Registro no encontrado" });
      }

      const updated = await RegistrosModel.update(id, {
        formulario_id: formulario_id ?? null,
        usuario_id: usuario_id ?? null,
        accion,
        observacion: observacion || null,
        fecha: fecha ? new Date(fecha) : exists.fecha || new Date(),
      });

      res.json({
        status: "success",
        message: "Registro actualizado",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await RegistrosModel.getById(id);
      if (!exists) {
        return res
          .status(404)
          .json({ status: "error", message: "Registro no encontrado" });
      }

      const result = await RegistrosModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default RegistrosController;
