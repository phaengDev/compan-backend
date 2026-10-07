import { Request, Response } from "express";
import { joinAgent, joinCol, joinCompany, joinTypeInsurance } from "../../utils/queryIncludes";
import { CommissionPay } from "../../models";

export const commissionPayPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { company_id_fk, agent_id_fk, typeList } = req.body;
    const existingRecords = await CommissionPay.findAll({ where: { company_id_fk, agent_id_fk }, raw: true });
    const existingTypeIds = new Set(existingRecords.map((record: any) => String(record.insurnce_type_fk)));

    const newRows = (typeList || [])
      .filter((item: any) => !existingTypeIds.has(String(item.insurnce_type_fk)))
      .map((item: any) => ({
        company_id_fk,
        agent_id_fk,
        insurnce_type_fk: item.insurnce_type_fk,
        percent: item.percent,
      }));

    if (newRows.length > 0) {
      await CommissionPay.bulkCreate(newRows);
    }

    res.status(200).json({ message: "ການຕັດໜີ້ໄດ້ສຳເລັດແລ້ວ" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "ການແຊກຂໍ້ມູນລົ້ມເຫລວ" });
  }
};

export const commissionPayDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await CommissionPay.destroy({ where: { comis_agent_id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in commissionPayDeleteById:", error);
    res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const commissionPayPutEdit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { comis_agent_id, percent } = req.body;
    const [rowsUpdated] = await CommissionPay.update({ percent }, { where: { comis_agent_id } });

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await CommissionPay.findByPk(comis_agent_id);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in commissionPayPutEdit:", error);
    res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
  }
};

export const commissionPayPostSingle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId_fk, insurnce_typeId, agentId_fk } = req.body;
    const data = await CommissionPay.findOne({
      where: {
        company_id_fk: companyId_fk,
        insurnce_type_fk: insurnce_typeId,
        agent_id_fk: agentId_fk,
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in commissionPayPostSingle:", error);
    res.status(400).send();
  }
};

export const commissionPayPostFetch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId_fk, insurnce_typeId, agentId_fk } = req.body;
    const where: any = {};
    if (companyId_fk) where.company_id_fk = companyId_fk;
    if (insurnce_typeId) where.insurnce_type_fk = insurnce_typeId;
    if (agentId_fk) where.agent_id_fk = agentId_fk;

    const data = await CommissionPay.findAll({
      attributes: [
        "comis_agent_id",
        "company_id_fk",
        "insurnce_type_fk",
        "agent_id_fk",
        "percent",
        joinCol("company.com_name_lao"),
        joinCol("typeInsurance.type_in_name"),
        joinCol("agent.agent_name"),
      ],
      include: [joinCompany({ where: { com_status: 1 } }), joinTypeInsurance(), joinAgent()],
      where,
      raw: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in commissionPayPostFetch:", error);
    res.status(400).send();
  }
};
