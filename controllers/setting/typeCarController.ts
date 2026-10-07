import { Request, Response } from "express";
import { maxid } from "../../utils";
import TypeCar from "../../models/tables/typeCarModel";

export const typeCarPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { typecarId, typecar_name } = req.body;

    if (!typecarId) {
      const typecar_Id = await maxid(TypeCar, "typecar_Id");
      const data = await TypeCar.create({ typecar_Id, typecar_name });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const [rowsUpdated] = await TypeCar.update(
      { typecar_name },
      { where: { typecar_Id: typecarId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await TypeCar.findByPk(typecarId);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in typeCarPostCreate:", error);
    res.status(500).json({ error: "ການດຳເນີນງານບໍ່ສຳເລັດ" });
  }
};

export const typeCarDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const rowsDeleted = await TypeCar.destroy({ where: { typecar_Id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data: rowsDeleted });
  } catch (error) {
    console.error("Error in typeCarDeleteById:", error);
    res.status(500).json({ error: "ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const typeCarGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await TypeCar.findAll({ order: [["typecar_Id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in typeCarGetRoot:", error);
    res.status(400).send();
  }
};
