import { sql } from "../config/server.js";
import BaseModel from "./BaseModel.js";

const baseModel = new BaseModel("historial_estados", [
  { name: "id", sqlType: sql.Int, param: "id" },
  { name: "formulario_id", sqlType: sql.Int, param: "formularioId" },
  { name: "estado_id", sqlType: sql.Int, param: "estadoId" },
  { name: "usuario_id", sqlType: sql.Int, param: "usuarioId" },
  { name: "fecha", sqlType: sql.DateTime, param: "fecha" },
  { name: "observacion", sqlType: sql.NVarChar(sql.MAX), param: "observacion" },
]);

class HistorialEstadosModel {
  static getAll = () => baseModel.getAll();
  static getById = (id) => baseModel.getById(id);
  static create = (data) => {
    return baseModel.create({
      formularioId: data.formulario_id,
      estadoId: data.estado_id,
      usuarioId: data.usuario_id,
      fecha: data.fecha || new Date(),
      observacion: data.observacion ?? null,
    });
  };
  static update = (id, data) => {
    return baseModel.update(id, {
      formularioId: data.formulario_id,
      estadoId: data.estado_id,
      usuarioId: data.usuario_id,
      fecha: data.fecha,
      observacion: data.observacion,
    });
  };
  static delete = (id) => baseModel.delete(id);
}

export default HistorialEstadosModel;
