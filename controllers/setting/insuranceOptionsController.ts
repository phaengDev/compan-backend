import { Request, Response } from "express";
import { maxid } from "../../utils";
import InsuranceOption from "../../models/tables/insuranceOptionModel";

export const insuranceOptionsPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { optionsId, insurance_type_fk, options_name, option_vat } = req.body;

    if (!optionsId) {
      const options_Id = await maxid(InsuranceOption, "options_Id");
      const data = await InsuranceOption.create({ options_Id, insurance_type_fk, options_name, option_vat });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const [rowsUpdated] = await InsuranceOption.update(
      { insurance_type_fk, options_name, option_vat },
      { where: { options_Id: optionsId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await InsuranceOption.findByPk(optionsId);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in insuranceOptionsPostCreate:", error);
    res.status(500).json({ error: "ການດຳເນີນງານບໍ່ສຳເລັດ" });
  }
};

export const insuranceOptionsDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await InsuranceOption.destroy({ where: { options_Id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in insuranceOptionsDeleteById:", error);
    res.status(500).json({ error: "ການລືບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const insuranceOptionsPatchRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await InsuranceOption.findAll({ order: [["options_Id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in insuranceOptionsPatchRoot:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const insuranceOptionsGetTById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await InsuranceOption.findAll({
      where: { insurance_type_fk: req.params.id },
      order: [["options_Id", "ASC"]],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in insuranceOptionsGetTById:", error);
    res.status(400).send(error);
  }
};

export const insuranceOptionsPatchById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await InsuranceOption.findByPk(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in insuranceOptionsPatchById:", error);
    res.status(400).send();
  }
};
