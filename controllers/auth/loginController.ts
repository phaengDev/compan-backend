import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import UserAccount from "../../models/tables/userAccountModel";

const dateTime = moment().format("YYYY-MM-DD HH:mm:ss");

export const loginPostCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userEmail, userPassword } = req.body;
    const user = await UserAccount.findOne({
      attributes: [
        "user_Id",
        "user_type_fk",
        "company_agent_fk",
        "depart_id_fk",
        "userName",
        "userEmail",
        "userPassword",
        "statusUse",
      ],
      where: { userEmail, statusOff: 1 },
    });

    if (!user) {
      res.status(400).json({
        status: "400",
        message: "ຊື່ອີເມວບໍ່ຖືກຕ້ອງ",
      });
      return;
    }

    const userData = user.get({ plain: true }) as any;
    const passwordMatched = await bcrypt.compare(userPassword, userData.userPassword);
    if (!passwordMatched) {
      res.status(400).json({
        status: "400",
        message: "ຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
      });
      return;
    }

    const payload = {
      user_Id: userData.user_Id,
      userEmail: userData.userEmail,
      create_date: dateTime,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_secret_key", { expiresIn: "1h" });

    res.status(200).json({
      status: "200",
      message: "ການເຂົ້າສູ້ລະບົບໄດສຳເລັດແລ້ວ",
      token,
      user_Id: userData.user_Id,
      userEmail: userData.userEmail,
      username: userData.userName,
      company_agent_fk: userData.company_agent_fk,
      user_type_fk: userData.user_type_fk,
      statusUse: userData.statusUse,
    });
  } catch (error) {
    console.error("Error checking login:", error);
    res.status(500).json({
      status: "500",
      message: "ເຊີບເວີພາຍໃນມີການຜິດພາດ",
    });
  }
};
