import { sql } from "../config/server.js";
import BaseModel from "./BaseModel.js";

const baseModel = new BaseModel("sla_estados", [
  { name: "id", sqlType: sql.Int, param: "id" },
  { name: "estado_id", sqlType: sql.Int, param: "estadoId" },
  { name: "producto_id", sqlType: sql.Int, param: "productoId" },
  { name: "dias_maximos", sqlType: sql.Int, param: "diasMaximos" },
]);

class SlaEstadosModel {
  static getAll = () => baseModel.getAll();
  static getById = (id) => baseModel.getById(id);
  static create = (data) => {
    return baseModel.create({
      estadoId: data.estado_id ?? null,
      productoId: data.producto_id ?? null,
      diasMaximos: data.dias_maximos,
    });
  };
  static update = (id, data) => {
    return baseModel.update(id, {
      estadoId: data.estado_id,
      productoId: data.producto_id,
      diasMaximos: data.dias_maximos,
    });
  };
  static delete = (id) => baseModel.delete(id);
}

export default SlaEstadosModel;
