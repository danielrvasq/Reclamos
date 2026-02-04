import MatrizDireccionamientoModel from "../models/matrizDireccionamientoModel.js";

class MatrizDireccionamientoController {
  static async getAll(req, res) {
    try {
      const items = await MatrizDireccionamientoModel.getAll();
      res.json({ status: "success", data: items });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await MatrizDireccionamientoModel.getById(id);
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
      const {
        clasificacion_id,
        clase_id,
        causa_id,
        primer_contacto_id,
        tiempo_atencion_inicial_dias,
        responsable_tratamiento_id,
        correo_responsable,
        tiempo_respuesta_dias,
        tipo_respuesta,
        activo,
        created_at,
      } = req.body;

      // Validar campos clave de direccionamiento
      if (!clasificacion_id || !clase_id || !causa_id) {
        return res.status(400).json({
          status: "error",
          message: "clasificacion_id, clase_id y causa_id son requeridos",
        });
      }

      const newItem = await MatrizDireccionamientoModel.create({
        clasificacion_id,
        clase_id,
        causa_id,
        primer_contacto_id: primer_contacto_id ?? null,
        tiempo_atencion_inicial_dias: tiempo_atencion_inicial_dias ?? null,
        responsable_tratamiento_id: responsable_tratamiento_id ?? null,
        correo_responsable: correo_responsable || null,
        tiempo_respuesta_dias: tiempo_respuesta_dias ?? null,
        tipo_respuesta: tipo_respuesta || null,
        activo: typeof activo === "boolean" ? activo : true,
        created_at: created_at ? new Date(created_at) : new Date(),
      });

      res.status(201).json({
        status: "success",
        message: "Matriz direccionamiento creada",
        data: newItem,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        clasificacion_id,
        clase_id,
        causa_id,
        primer_contacto_id,
        tiempo_atencion_inicial_dias,
        responsable_tratamiento_id,
        correo_responsable,
        tiempo_respuesta_dias,
        tipo_respuesta,
        activo,
      } = req.body;

      if (!clasificacion_id || !clase_id || !causa_id) {
        return res.status(400).json({
          status: "error",
          message: "clasificacion_id, clase_id y causa_id son requeridos",
        });
      }

      const exists = await MatrizDireccionamientoModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Registro no encontrado" });

      const updated = await MatrizDireccionamientoModel.update(id, {
        clasificacion_id,
        clase_id,
        causa_id,
        primer_contacto_id: primer_contacto_id ?? null,
        tiempo_atencion_inicial_dias: tiempo_atencion_inicial_dias ?? null,
        responsable_tratamiento_id: responsable_tratamiento_id ?? null,
        correo_responsable: correo_responsable || null,
        tiempo_respuesta_dias: tiempo_respuesta_dias ?? null,
        tipo_respuesta: tipo_respuesta || null,
        activo: typeof activo === "boolean" ? activo : exists.activo,
      });

      res.json({
        status: "success",
        message: "Matriz direccionamiento actualizada",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const exists = await MatrizDireccionamientoModel.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ status: "error", message: "Registro no encontrado" });

      const result = await MatrizDireccionamientoModel.delete(id);
      res.json({ status: "success", message: result.message });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

export default MatrizDireccionamientoController;
