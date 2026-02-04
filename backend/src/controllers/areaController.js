import AreaModel from "../models/areaModel.js";

class AreaController {
  // GET: todas las áreas
  static async getAllAreas(req, res) {
    try {
      const areas = await AreaModel.getAllAreas();
      res.json({ status: "success", data: areas });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // GET: área por ID
  static async getAreaById(req, res) {
    try {
      const { id } = req.params;
      const area = await AreaModel.getAreaById(id);

      if (!area) {
        return res
          .status(404)
          .json({ status: "error", message: "Área no encontrada" });
      }

      res.json({ status: "success", data: area });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // POST: crear área
  static async createArea(req, res) {
    try {
      const { nombre, responsable } = req.body;

      if (!nombre) {
        return res.status(400).json({
          status: "error",
          message: "nombre es requerido",
        });
      }

      const newArea = await AreaModel.createArea({ nombre, responsable });

      res.status(201).json({
        status: "success",
        message: "Área creada correctamente",
        data: newArea,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // PUT: actualizar área
  static async updateArea(req, res) {
    try {
      const { id } = req.params;
      const { nombre, responsable } = req.body;

      if (!nombre) {
        return res.status(400).json({
          status: "error",
          message: "nombre es requerido",
        });
      }

      const areaExists = await AreaModel.getAreaById(id);
      if (!areaExists) {
        return res
          .status(404)
          .json({ status: "error", message: "Área no encontrada" });
      }

      const updatedArea = await AreaModel.updateArea(id, {
        nombre,
        responsable,
      });

      res.json({
        status: "success",
        message: "Área actualizada correctamente",
        data: updatedArea,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // DELETE: eliminar área
  static async deleteArea(req, res) {
    try {
      const { id } = req.params;

      const areaExists = await AreaModel.getAreaById(id);
      if (!areaExists) {
        return res
          .status(404)
          .json({ status: "error", message: "Área no encontrada" });
      }

      const result = await AreaModel.deleteArea(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default AreaController;
