import { Request, Response } from "express";
import District from "../../models/tables/districtModel";

export const districtPatchRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await District.findAll({ order: [["district_id", "ASC"]] });
    res.status(200).json({data});
  } catch (error) {
    console.error("Error in districtPatchRoot:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const districtGetById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await District.findByPk(req.params.id);
    res.status(200).json({data});
  } catch (error) {
    console.error("Error in districtGetById:", error);
    res.status(400).send();
  }
};

export const districtGetPvById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await District.findAll({
      where: { provice_fk: req.params.id },
      order: [["district_name", "ASC"]],
    });
    res.status(200).json({data});
  } catch (error) {
    console.error("Error in districtGetPvById:", error);
    res.status(400).send(error);
  }
};
