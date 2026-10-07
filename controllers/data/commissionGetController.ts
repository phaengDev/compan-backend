import { Request, Response } from "express";
import { joinCol, joinCompany, joinTypeInsurance } from "../../utils/queryIncludes";
import { CommissionGet, CommissionPay } from "../../models";

export const commissionGetPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { company_id_fk, typeList } = req.body;
    const existingRecords = await CommissionGet.findAll({ where: { company_id_fk }, raw: true });
    const existingTypeIds = new Set(existingRecords.map((record: any) => String(record.insurnce_type_fk)));

    const newRows = (typeList || [])
      .filter((item: any) => !existingTypeIds.has(String(item.insurnce_type_fk)))
      .map((item: any) => ({
        company_id_fk,
        insurnce_type_fk: item.insurnce_type_fk,
        percent: item.percent,
      }));

    if (newRows.length > 0) {
      await CommissionGet.bulkCreate(newRows);
    }

    res.status(200).json({ message: "ການຕັດໜີ້ໄດ້ສຳເລັດແລ້ວ" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "ການແຊກຂໍ້ມູນລົ້ມເຫລວ" });
  }
};

export const commissionGetDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await CommissionGet.destroy({ where: { comis_oac_id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in commissionGetDeleteById:", error);
    res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const commissionGetPutEdit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { comis_oac_id, percent } = req.body;
    const [rowsUpdated] = await CommissionGet.update({ percent }, { where: { comis_oac_id } });

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await CommissionGet.findByPk(comis_oac_id);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in commissionGetPutEdit:", error);
    res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
  }
};

export const commissionGetPostSingle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, typeinsId, agentId } = req.body;
    const getRecord = await CommissionGet.findOne({
      where: { company_id_fk: companyId, insurnce_type_fk: typeinsId },
      raw: true,
    });
    const payRecord = await CommissionPay.findOne({
      where: { company_id_fk: companyId, insurnce_type_fk: typeinsId, agent_id_fk: agentId },
      raw: true,
    });

    res.status(200).json({
      percentGet: getRecord ? (getRecord as any).percent || 0 : 0,
      percentPay: payRecord ? (payRecord as any).percent || 0 : 0,
    });
  } catch (error) {
    console.error("Error in commissionGetPostSingle:", error);
    res.status(400).json({ message: "Error fetching commission data" });
  }
};

export const commissionGetPostFetch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId_fk, insurnce_typeId } = req.body;
    const where: any = {};
    if (companyId_fk) where.company_id_fk = companyId_fk;
    if (insurnce_typeId) where.insurnce_type_fk = insurnce_typeId;

    const data = await CommissionGet.findAll({
      attributes: [
        "comis_oac_id",
        "company_id_fk",
        "insurnce_type_fk",
        "percent",
        joinCol("company.com_name_lao"),
        joinCol("typeInsurance.type_in_name"),
      ],
      include: [joinCompany({ where: { com_status: 1 } }), joinTypeInsurance()],
      where,
      raw: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in commissionGetPostFetch:", error);
    res.status(400).send();
  }
};
