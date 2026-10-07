import { Request, Response } from "express";
import { maxid } from "../../utils";
import VersionCar from "../../models/tables/versionCarModel";

export const versionCarsPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { versionId, version_name } = req.body;

    if (!versionId) {
      const version_Id = await maxid(VersionCar, "version_Id");
      const data = await VersionCar.create({ version_Id, version_name });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const [rowsUpdated] = await VersionCar.update(
      { version_name },
      { where: { version_Id: versionId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await VersionCar.findByPk(versionId);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in versionCarsPostCreate:", error);
    res.status(500).json({ error: "ການດຳເນີນງານບໍ່ສຳເລັດ" });
  }
};

export const versionCarsDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await VersionCar.destroy({ where: { version_Id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in versionCarsDeleteById:", error);
    res.status(500).json({ error: "ການລືບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const versionCarsGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await VersionCar.findAll({ order: [["version_Id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in versionCarsGetRoot:", error);
    res.status(400).send();
  }
};

export const versionCarsPatchById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await VersionCar.findByPk(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in versionCarsPatchById:", error);
    res.status(400).send();
  }
};
