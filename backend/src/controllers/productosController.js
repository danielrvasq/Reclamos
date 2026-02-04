import ProductosModel from "../models/productosModel.js";

class ProductosController {
  // GET: todos
  static async getAll(req, res) {
    try {
      const items = await ProductosModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // GET: por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await ProductosModel.getById(id);
      if (!item) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }
      res.json({ status: "success", data: item });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // POST: crear
  static async create(req, res) {
    try {
      const { codigo, nombre, descripcion, tipo_producto_id, activo } =
        req.body;

      if (!nombre) {
        return res
          .status(400)
          .json({ status: "error", message: "El nombre es requerido" });
      }

      const newItem = await ProductosModel.create({
        codigo,
        nombre,
        descripcion,
        tipo_producto_id,
        activo: typeof activo === "boolean" ? activo : true,
      });

      res.status(201).json({
        status: "success",
        message: "Producto creado",
        data: newItem,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // PUT: actualizar
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { codigo, nombre, descripcion, tipo_producto_id, activo } =
        req.body;

      if (!nombre) {
        return res
          .status(400)
          .json({ status: "error", message: "El nombre es requerido" });
      }

      const exists = await ProductosModel.getById(id);
      if (!exists) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      const updated = await ProductosModel.update(id, {
        codigo,
        nombre,
        descripcion,
        tipo_producto_id:
          tipo_producto_id !== undefined
            ? tipo_producto_id
            : exists.tipo_producto_id,
        activo: typeof activo === "boolean" ? activo : exists.activo,
      });

      res.json({
        status: "success",
        message: "Producto actualizado",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // DELETE: eliminar
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await ProductosModel.getById(id);
      if (!exists) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      const result = await ProductosModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default ProductosController;
