import BaseController from "./BaseController.js";
import HistorialEstadosModel from "../models/historialEstadosModel.js";

const baseController = new BaseController(
  HistorialEstadosModel,
  "Historial estado"
);

class HistorialEstadosController {
  static getAll = (req, res) => baseController.getAll(req, res);
  static getById = (req, res) => baseController.getById(req, res);
  static create = (req, res) => baseController.create(req, res);
  static update = (req, res) => baseController.update(req, res);
  static delete = (req, res) => baseController.delete(req, res);
}

export default HistorialEstadosController;
