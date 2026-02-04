import BaseController from "./BaseController.js";
import SlaEstadosModel from "../models/slaEstadosModel.js";

const baseController = new BaseController(SlaEstadosModel, "SLA estado");

class SlaEstadosController {
  static getAll = (req, res) => baseController.getAll(req, res);
  static getById = (req, res) => baseController.getById(req, res);
  static create = (req, res) => baseController.create(req, res);
  static update = (req, res) => baseController.update(req, res);
  static delete = (req, res) => baseController.delete(req, res);
}

export default SlaEstadosController;
