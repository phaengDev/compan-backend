import { Request, Response } from "express";
import { maxid } from "../../utils";
import BrandCar from "../../models/tables/brandCarModel";

export const brandsCarsPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandsId, brands_name } = req.body;

    if (!brandsId) {
      const brands_Id = await maxid(BrandCar, "brands_Id");
      const data = await BrandCar.create({ brands_Id, brands_name });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const [rowsUpdated] = await BrandCar.update(
      { brands_name },
      { where: { brands_Id: brandsId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await BrandCar.findByPk(brandsId);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in brandsCarsPostCreate:", error);
    res.status(500).json({ error: "ການດຳເນີນງານບໍ່ສຳເລັດ" });
  }
};

export const brandsCarsDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await BrandCar.destroy({ where: { brands_Id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in brandsCarsDeleteById:", error);
    res.status(500).json({ error: "ການລືບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const brandsCarsGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await BrandCar.findAll({ order: [["brands_Id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in brandsCarsGetRoot:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const brandsCarsPatchById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await BrandCar.findByPk(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in brandsCarsPatchById:", error);
    res.status(400).send();
  }
};
