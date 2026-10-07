import { Request, Response } from "express";
import { literal } from "sequelize";
import { maxid } from "../../utils";
import { joinInsurances } from "../../utils/queryIncludes";
import { InsuranceOption, TypeBuyer, TypeInsurance } from "../../models";

export const typeInsurancePostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type_ins_Id, status_ins, type_in_name } = req.body;

    if (!type_ins_Id) {
      const type_insid = await maxid(TypeInsurance, "type_insid");
      const data = await TypeInsurance.create({ type_insid, status_ins, type_in_name });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const [rowsUpdated] = await TypeInsurance.update(
      { status_ins, type_in_name },
      { where: { type_insid: type_ins_Id } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await TypeInsurance.findByPk(type_ins_Id);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in typeInsurancePostCreate:", error);
    res.status(500).json({ error: "ການດຳເນີນງານບໍ່ສຳເລັດ" });
  }
};

export const typeInsuranceDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await TypeInsurance.destroy({ where: { type_insid: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in typeInsuranceDeleteById:", error);
    res.status(500).json({ error: "ການລືບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const typeInsuranceGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await TypeInsurance.findAll({
      attributes: [
        "type_insid",
        "status_ins",
        "type_in_name",
        [
          literal("(SELECT COUNT(*) FROM oac_insurance_options WHERE insurance_type_fk = TypeInsurance.type_insid)"),
          "qty_option",
        ],
      ],
      order: [["type_insid", "ASC"]],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in typeInsuranceGetRoot:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const typeInsuranceGetCustById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await TypeInsurance.findAll({
      attributes: ["type_insid", "status_ins", "type_in_name"],
      include: [
        {
          model: InsuranceOption,
          as: "options",
          attributes: [],
          required: true,
          include: [joinInsurances({ where: { custom_id_fk: req.params.id } })],
        },
      ],
      group: ["TypeInsurance.type_insid", "TypeInsurance.status_ins", "TypeInsurance.type_in_name"],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in typeInsuranceGetCustById:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const typeInsuranceGetCmById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await TypeInsurance.findAll({
      attributes: ["type_insid", "status_ins", "type_in_name"],
      include: [
        {
          model: InsuranceOption,
          as: "options",
          attributes: [],
          required: true,
          include: [joinInsurances({ where: { company_id_fk: req.params.id } })],
        },
      ],
      group: ["TypeInsurance.type_insid", "TypeInsurance.status_ins", "TypeInsurance.type_in_name"],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in typeInsuranceGetCmById:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const typeInsuranceGetSById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await TypeInsurance.findAll({ where: { status_ins: req.params.id } });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in typeInsuranceGetSById:", error);
    res.status(400).send(error);
  }
};

export const typeInsuranceGetTypebuy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await TypeBuyer.findAll({ order: [["type_buyer_id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in typeInsuranceGetTypebuy:", error);
    res.status(400).send();
  }
};

export const typeInsuranceGetById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await TypeInsurance.findByPk(req.params.id, {
      attributes: ["type_insid", "status_ins", "type_in_name"],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in typeInsuranceGetById:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};
