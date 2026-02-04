import BaseController from "./BaseController.js";
import InformesModel from "../models/informesModel.js";

const baseController = new BaseController(InformesModel, "Informe");

class InformesController {
  static getAll = (req, res) => baseController.getAll(req, res);
  static getById = (req, res) => baseController.getById(req, res);
  static create = (req, res) => baseController.create(req, res);
  static update = (req, res) => baseController.update(req, res);
  static delete = (req, res) => baseController.delete(req, res);
}

export default InformesController;
