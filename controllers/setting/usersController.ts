import { Request, Response } from "express";
import { literal } from "sequelize";
import bcrypt from "bcryptjs";
import moment from "moment";
import { maxid } from "../../utils";
import { asDateTime, joinAgent, joinCol, joinCompany, joinCustomer, joinDepartment } from "../../utils/queryIncludes";
import { UserAccount } from "../../models";

const dateTime = moment().format("YYYY-MM-DD HH:mm:ss");
const statusOffName = literal("CASE statusOff WHEN '1' THEN 'ເປິດໃຊ້ງານ' ELSE 'ປິດໃຊ້ງານ' END");

export const usersPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      user_type_fk,
      company_agent_fk,
      depart_id_fk,
      userName,
      userEmail,
      statusUse,
      statusOff,
    } = req.body;

    if (!userId) {
      const user_Id = await maxid(UserAccount, "user_Id");
      const userPassword = bcrypt.hashSync(req.body.userPassword);
      const data = await UserAccount.create({
        user_Id,
        user_type_fk,
        company_agent_fk,
        depart_id_fk,
        userName,
        userEmail,
        userPassword,
        statusUse,
        statusOff,
        userCreate: asDateTime(dateTime),
      });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const [rowsUpdated] = await UserAccount.update(
      { user_type_fk, company_agent_fk, depart_id_fk, userName, userEmail, statusOff },
      { where: { user_Id: userId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await UserAccount.findByPk(userId);
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in usersPostCreate:", error);
    res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const usersPostEditpass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userEmail } = req.body;
    const userPassword = bcrypt.hashSync(req.body.userPassword);
    const [rowsUpdated] = await UserAccount.update(
      { userEmail, userPassword },
      { where: { user_Id: userId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await UserAccount.findByPk(userId);
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in usersPostEditpass:", error);
    res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const usersDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await UserAccount.destroy({ where: { user_Id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in usersDeleteById:", error);
    res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const usersGetOac = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await UserAccount.findAll({
      attributes: [
        "user_Id",
        "userName",
        "userEmail",
        "userPassword",
        "statusUse",
        "statusOff",
        [literal("CASE statusUse WHEN '1' THEN 'Admin' ELSE 'User' END"), "statusName"],
        [statusOffName, "offName"],
        "userCreate",
        joinCol("department.departName"),
        "depart_id_fk",
        "company_agent_fk",
      ],
      include: [joinDepartment()],
      where: { user_type_fk: 1 },
      raw: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in usersGetOac:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const usersGetAgent = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await UserAccount.findAll({
      attributes: [
        "user_Id",
        "userName",
        "userEmail",
        "userPassword",
        "statusUse",
        "statusOff",
        [statusOffName, "offName"],
        "userCreate",
        joinCol("agent.agent_name"),
        "company_agent_fk",
      ],
      include: [joinAgent()],
      where: { user_type_fk: 2 },
      raw: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in usersGetAgent:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const usersGetBuy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await UserAccount.findAll({
      attributes: [
        "user_Id",
        "userName",
        "userEmail",
        "userPassword",
        "statusUse",
        "statusOff",
        [statusOffName, "offName"],
        "userCreate",
        joinCol("customer.customer_name"),
        "company_agent_fk",
      ],
      include: [joinCustomer()],
      where: { user_type_fk: 3 },
      raw: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in usersGetBuy:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const usersGetCmn = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await UserAccount.findAll({
      attributes: [
        "user_Id",
        "userName",
        "userEmail",
        "userPassword",
        "statusUse",
        "statusOff",
        [statusOffName, "offName"],
        "userCreate",
        joinCol("company.com_name_lao"),
        joinCol("company.com_name_eng"),
        "company_agent_fk",
      ],
      include: [joinCompany()],
      where: { user_type_fk: 4 },
      raw: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in usersGetCmn:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const usersGetById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await UserAccount.findByPk(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in usersGetById:", error);
    res.status(400).send();
  }
};
