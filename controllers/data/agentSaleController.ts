import { Request, Response } from "express";
import { literal } from "sequelize";
import moment from "moment";
import { maxid } from "../../utils";
import { getDistrictInclude, joinInsurances } from "../../utils/queryIncludes";
import { AgentSale, Insurance } from "../../models";

const dateNow = moment().format("YYYY-MM-DD");

export const agentSalePostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agentId, idcrad_code, agent_name, agent_dob, district_id_fk, agent_village, agent_tel } = req.body;

    if (!agentId) {
      const agent_Id = await maxid(AgentSale, "agent_Id");
      const data = await AgentSale.create({
        agent_Id,
        idcrad_code,
        agent_name,
        agent_dob,
        district_id_fk,
        agent_village,
        agent_tel,
        agent_status: 1,
        create_date: dateNow,
      });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const [rowsUpdated] = await AgentSale.update(
      { idcrad_code, agent_name, agent_dob, district_id_fk, agent_village, agent_tel },
      { where: { agent_Id: agentId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await AgentSale.findByPk(agentId);
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in agentSalePostCreate:", error);
    res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
  }
};

export const agentSaleGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await AgentSale.findAll({
      attributes: {
        include: [
          [
            literal("(SELECT COUNT(agent_id_fk) FROM oac_insurance WHERE agent_id_fk = AgentSale.agent_Id)"),
            "qtycontart",
          ],
        ],
      },
      where: { agent_status: 1 },
      include: [getDistrictInclude()],
      order: [["agent_Id", "ASC"]],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in agentSaleGetRoot:", error);
    res.status(400).send();
  }
};

export const agentSaleGetCustById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await AgentSale.findAll({
      attributes: [
        "agent_name",
        "agent_Id",
        [
          literal("(SELECT COUNT(agent_id_fk) FROM oac_insurance WHERE agent_id_fk = AgentSale.agent_Id)"),
          "qtycontart",
        ],
      ],
      where: { agent_status: 1 },
      include: [joinInsurances({ where: { custom_id_fk: req.params.id } })],
      group: ["AgentSale.agent_Id", "AgentSale.agent_name"],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in agentSaleGetCustById:", error);
    res.status(400).send();
  }
};

export const agentSaleGetOption = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await AgentSale.findAll({ order: [["agent_Id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in agentSaleGetOption:", error);
    res.status(400).send();
  }
};

export const agentSaleDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const agent_Id = req.params.id;
    const insuranceCount = await Insurance.count({ where: { agent_id_fk: agent_Id } });

    if (insuranceCount > 0) {
      res.status(404).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ" });
      return;
    }

    await AgentSale.destroy({ where: { agent_Id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ" });
  } catch (error) {
    console.error("Error in agentSaleDeleteById:", error);
    res.status(400).json({ message: "Error while deleting the agent" });
  }
};
