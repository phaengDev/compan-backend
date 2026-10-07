import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import moment from "moment";
import DocInsurance from "../../models/tables/docInsuranceModel";
import { asDateTime } from "../../utils/queryIncludes";

const dateTime = moment().format("YYYY-MM-DD HH:mm:ss");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "./assets/docfile");
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `file-${Date.now()}${ext}`);
  },
});

export const upload = multer({ storage });

export const uploadFilePostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contract_code_fk } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || !contract_code_fk) {
      res.status(400).send("Missing required data");
      return;
    }

    await DocInsurance.bulkCreate(
      files.map((file) => ({
        contract_code_fk,
        file_insurance: file.filename,
        create_date: asDateTime(dateTime),
      }))
    );

    res.status(200).json({ message: "ການບັນທຶກຂໍ້ມູນສ້ຳເລັດ" });
  } catch (error) {
    console.error("Error inserting data into SQL:", error);
    res.status(500).send("Server error");
  }
};

export const uploadFileDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const file = await DocInsurance.findByPk(req.params.id);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const fileName = (file as any).file_insurance;
    if (fileName) {
      fs.unlink(path.join("assets/docfile", fileName), (error) => {
        if (error) console.error("Error deleting the existing file:", error);
      });
    }

    await DocInsurance.destroy({ where: { file_doc_id: req.params.id } });
    res.status(200).json({ message: "ການລົບຂໍ້ມູນໄດ້ສຳເລັດ" });
  } catch (error) {
    console.error("Error doc insurance data:", error);
    res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const uploadFilePostDelmt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileData } = req.body;

    await Promise.all(
      (fileData || []).map(async (item: any) => {
        if (item.file_insurance) {
          await fs.promises.unlink(path.join("assets/docfile", item.file_insurance)).catch(() => undefined);
        }
        await DocInsurance.destroy({ where: { file_doc_id: item.file_doc_id } });
      })
    );

    res.status(200).json({ message: "ການລົບຂໍ້ມູນໄດ້ສຳເລັດ" });
  } catch (error) {
    console.error("Error in uploadFilePostDelmt:", error);
    res.status(500).json({ message: "ການແຊກຂໍ້ມູນລົ້ມເຫລວ" });
  }
};
