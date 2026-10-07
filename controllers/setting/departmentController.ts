import { Request, Response } from "express";
import Department from "../../models/tables/departmentModel";

export const departmentGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Department.findAll({ order: [["depat_Id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in departmentGetRoot:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const departmentGetById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await Department.findByPk(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in departmentGetById:", error);
    res.status(400).send();
  }
};
