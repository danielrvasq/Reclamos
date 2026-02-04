import { sql } from "../config/server.js";
import BaseModel from "./BaseModel.js";

const baseModel = new BaseModel("flujo_estados", [
  { name: "id", sqlType: sql.Int, param: "id" },
  { name: "estado_origen_id", sqlType: sql.Int, param: "estadoOrigenId" },
  { name: "estado_destino_id", sqlType: sql.Int, param: "estadoDestinoId" },
  { name: "rol_id", sqlType: sql.Int, param: "rolId" },
]);

class FlujoEstadosModel {
  static getAll = () => baseModel.getAll();
  static getById = (id) => baseModel.getById(id);
  static create = (data) => {
    return baseModel.create({
      estadoOrigenId: data.estado_origen_id ?? null,
      estadoDestinoId: data.estado_destino_id ?? null,
      rolId: data.rol_id ?? null,
    });
  };
  static update = (id, data) => {
    return baseModel.update(id, {
      estadoOrigenId: data.estado_origen_id,
      estadoDestinoId: data.estado_destino_id,
      rolId: data.rol_id,
    });
  };
  static delete = (id) => baseModel.delete(id);
}

export default FlujoEstadosModel;
