/**
 * Controlador base con operaciones CRUD genéricas
 * Reduce código repetitivo en todos los controladores
 */
class BaseController {
  /**
   * @param {Object} model - El modelo a usar
   * @param {string} entityName - Nombre de la entidad (para mensajes)
   */
  constructor(model, entityName) {
    this.model = model;
    this.entityName = entityName;
  }

  // GET /
  async getAll(req, res) {
    try {
      const items = await this.model.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // GET /:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await this.model.getById(id);
      if (!item) {
        return res.status(404).json({
          status: "error",
          message: `${this.entityName} no encontrado`,
        });
      }
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // POST /
  async create(req, res) {
    try {
      const newItem = await this.model.create(req.body);
      res.status(201).json({
        status: "success",
        message: `${this.entityName} creado`,
        data: newItem,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // PUT /:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const exists = await this.model.getById(id);
      if (!exists) {
        return res.status(404).json({
          status: "error",
          message: `${this.entityName} no encontrado`,
        });
      }

      const updated = await this.model.update(id, req.body);
      res.json({
        status: "success",
        message: `${this.entityName} actualizado`,
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // DELETE /:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await this.model.getById(id);
      if (!exists) {
        return res.status(404).json({
          status: "error",
          message: `${this.entityName} no encontrado`,
        });
      }

      const result = await this.model.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default BaseController;
