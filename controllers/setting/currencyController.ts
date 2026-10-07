import { Request, Response } from "express";
import { maxid } from "../../utils";
import Currency from "../../models/tables/currencyModel";

const parseMoney = (value: unknown) => Number(String(value ?? "0").replace(/,/g, ""));

export const currencyPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currencyId, currency_name, genus, genus_laos } = req.body;
    const reate_price = parseMoney(req.body.reate_price);

    if (!currencyId) {
      const currency_id = await maxid(Currency, "currency_id");
      const data = await Currency.create({ currency_id, currency_name, genus, genus_laos, reate_price });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const [rowsUpdated] = await Currency.update(
      { currency_name, genus, genus_laos, reate_price },
      { where: { currency_id: currencyId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await Currency.findByPk(currencyId);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in currencyPostCreate:", error);
    res.status(500).json({ error: "ການດຳເນີນງານບໍ່ສຳເລັດ" });
  }
};

export const currencyDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    if (req.params.id === "22001") {
      res.status(500).json({ error: "ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ" });
      return;
    }

    const data = await Currency.destroy({ where: { currency_id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in currencyDeleteById:", error);
    res.status(500).json({ error: "ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const currencyGetRoot = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Currency.findAll({ order: [["currency_id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in currencyGetRoot:", error);
    res.status(400).send();
  }
};
