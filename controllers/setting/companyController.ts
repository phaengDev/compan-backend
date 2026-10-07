import { Request, Response, RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { maxid } from "../../utils";
import { joinInsurances } from "../../utils/queryIncludes";
import { Company, Insurance } from "../../models";

const uploadLogo = (companyId: number) => {
  let logoName = "";
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, "./assets/logo");
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      logoName = `logo-${companyId}${ext}`;
      cb(null, logoName);
    },
  });

  return {
    logoName: () => logoName,
    upload: multer({ storage }).single("com_logo"),
  };
};

const runUpload = (upload: RequestHandler, req: Request, res: Response) =>
  new Promise<void>((resolve, reject) => {
    upload(req, res, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

export const companyPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const company_Id = await maxid(Company, "company_Id");
    const logoUploader = uploadLogo(company_Id);
    await runUpload(logoUploader.upload, req, res);

    const { companyId, com_name_lao, com_name_eng, com_tel, com_address, com_status } = req.body;
    const uploadedLogo = logoUploader.logoName();

    if (!companyId) {
      const data = await Company.create({
        company_Id,
        com_logo: uploadedLogo,
        com_name_lao,
        com_name_eng,
        com_tel,
        com_address,
        com_status,
      });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
      return;
    }

    const currentCompany = await Company.findByPk(companyId);
    if (!currentCompany) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const currentLogo = (currentCompany as any).com_logo;
    if (currentLogo && uploadedLogo) {
      fs.unlink(path.join("assets/logo", currentLogo), (error) => {
        if (error) console.error("Error deleting the existing file:", error);
      });
    }

    const com_logo = uploadedLogo || currentLogo;
    const [rowsUpdated] = await Company.update(
      { com_logo, com_name_lao, com_name_eng, com_tel, com_address },
      { where: { company_Id: companyId } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await Company.findByPk(companyId);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in companyPostCreate:", error);
    res.status(500).json({ error: "ການດຳເນີນງານບໍ່ສຳເລັດ" });
  }
};

export const companyPostEdit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { company_Id, com_name_lao, com_name_eng, com_tel, com_address } = req.body;
    const [rowsUpdated] = await Company.update(
      { com_name_lao, com_name_eng, com_tel, com_address },
      { where: { company_Id } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await Company.findByPk(company_Id);
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in companyPostEdit:", error);
    res.status(500).json({ error: "ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const companyDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const company_Id = req.params.id;
    const insuranceCount = await Insurance.count({ where: { company_id_fk: company_Id } });

    if (insuranceCount > 0) {
      res.status(404).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ" });
      return;
    }

    const data = await Company.destroy({ where: { company_Id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in companyDeleteById:", error);
    res.status(500).json({ error: "ການລືບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const companyGetFetch = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Company.findAll({ order: [["company_Id", "ASC"]] });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in companyGetFetch:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const companyGetCustById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await Company.findAll({
      attributes: ["company_Id", "com_logo", "com_name_lao", "com_name_eng"],
      include: [joinInsurances({ where: { custom_id_fk: req.params.id } })],
      group: ["Company.company_Id", "Company.com_logo", "Company.com_name_lao", "Company.com_name_eng"],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in companyGetCustById:", error);
    res.status(400).send("ການສະແດງຂໍ້ມູນລົມເຫຼວ");
  }
};

export const companyPatchById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await Company.findByPk(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in companyPatchById:", error);
    res.status(400).send();
  }
};
