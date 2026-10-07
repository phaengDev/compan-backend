import { Request, Response } from "express";
import Province from "../../models/tables/provinceModel";

export const provinceGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Province.findAll({ order: [["province_id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in provinceGetRoot:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const provinceGetById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await Province.findByPk(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in provinceGetById:", error);
    res.status(400).send();
  }
};

export const provincePatchSectionById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await Province.findAll({ where: { section: req.params.id } as any });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in provincePatchSectionById:", error);
    res.status(400).send(error);
  }
};
