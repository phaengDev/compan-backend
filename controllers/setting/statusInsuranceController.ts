import { Request, Response } from "express";
import StatusStaff from "../../models/tables/statusStaffModel";

export const statusInsuranceGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await StatusStaff.findAll({ order: [["stauts_use_id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in statusInsuranceGetRoot:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};
