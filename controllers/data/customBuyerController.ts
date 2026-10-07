import { Request, Response, RequestHandler } from "express";
import { literal, Op } from "sequelize";
import moment from "moment";
import multer from "multer";
import path from "path";
import fs from "fs";
import { maxid } from "../../utils";
import { getDistrictInclude, joinCol, joinDistrict, joinInsurances } from "../../utils/queryIncludes";
import { CustomBuyer, Insurance, TypeBuyer } from "../../models";

const dateNow = moment().format("YYYY-MM-DD");

const uploadProfile = (customUuid: number) => {
  let profileName = "";
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, "./assets/profile");
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      profileName = `profile-${customUuid}${ext}`;
      cb(null, profileName);
    },
  });

  return {
    profileName: () => profileName,
    upload: multer({ storage }).single("custom_profile"),
  };
};

const runUpload = (upload: RequestHandler, req: Request, res: Response) =>
  new Promise<void>((resolve, reject) => {
    upload(req, res, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

export const customBuyerPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const custom_uuid = await maxid(CustomBuyer, "custom_uuid");
    const profileUploader = uploadProfile(custom_uuid);
    await runUpload(profileUploader.upload, req, res);

    const { customUuid, type_buyer_fk, customer_name, district_fk, village_name, registra_tel } = req.body;
    const uploadedProfile = profileUploader.profileName();

    if (!customUuid) {
      await CustomBuyer.create({
        custom_uuid,
        custom_profile: uploadedProfile,
        type_buyer_fk,
        customer_name,
        district_fk,
        village_name,
        registra_tel,
        status_changs: 1,
        create_date: dateNow,
      });
      res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", id: custom_uuid });
      return;
    }

    const currentCustomer = await CustomBuyer.findOne({ where: { custom_uuid: customUuid } });
    if (!currentCustomer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const currentProfile = (currentCustomer as any).custom_profile;
    if (currentProfile && uploadedProfile) {
      fs.unlink(path.join("assets/profile", currentProfile), (error) => {
        if (error) console.error("Error deleting the existing file:", error);
      });
    }

    const custom_profile = uploadedProfile || currentProfile;
    const [rowsUpdated] = await CustomBuyer.update(
      { custom_profile, type_buyer_fk, customer_name, district_fk, village_name, registra_tel },
      { where: { custom_uuid: customUuid } }
    );

    if (rowsUpdated === 0) {
      res.status(400).json({ message: "No changes made" });
      return;
    }

    const data = await CustomBuyer.findOne({ where: { custom_uuid: customUuid } });
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in customBuyerPostCreate:", error);
    res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
  }
};

export const customBuyerGetById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await CustomBuyer.findOne({
      where: { custom_uuid: req.params.id },
      include: [getDistrictInclude(), { model: TypeBuyer, as: "typeBuyer" }],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in customBuyerGetById:", error);
    res.status(400).send();
  }
};

export const customBuyerGetOptionById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await CustomBuyer.findAll({ where: { type_buyer_fk: req.params.id } });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in customBuyerGetOptionById:", error);
    res.status(400).send();
  }
};

export const customBuyerPostAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await CustomBuyer.findAll({ where: { status_changs: 1 } });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in customBuyerPostAll:", error);
    res.status(400).send();
  }
};

export const customBuyerGetCmById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await CustomBuyer.findAll({
      attributes: ["custom_uuid", "customer_name"],
      include: [joinInsurances({ where: { company_id_fk: req.params.id } })],
      group: ["CustomBuyer.custom_uuid", "CustomBuyer.customer_name"],
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in customBuyerGetCmById:", error);
    res.status(400).send();
  }
};

export const customBuyerPostRoot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provinceId, districtId, type_buyerId, companyId } = req.body;
    const where: any = { status_changs: 1 };
    if (type_buyerId) where.type_buyer_fk = type_buyerId;
    if (districtId) where.district_fk = districtId;
    if (provinceId) where["$district.provice_fk$"] = provinceId;
    if (companyId) where["$insurances.company_id_fk$"] = companyId;

    const data = await CustomBuyer.findAll({
      attributes: [
        "custom_uuid",
        "type_buyer_fk",
        "custom_profile",
        "customer_name",
        joinCol("district.provice_fk"),
        "district_fk",
        "village_name",
        "registra_tel",
        "status_changs",
        "create_date",
        joinCol("district.district_name"),
        joinCol("district.province.province_name"),
        [
          literal("(SELECT COUNT(custom_id_fk) FROM oac_insurance WHERE custom_id_fk = CustomBuyer.custom_uuid)"),
          "qtycontart",
        ],
      ],
      where,
      include: [joinDistrict(), joinInsurances({ required: Boolean(companyId) })],
      group: [
        "CustomBuyer.custom_uuid",
        "CustomBuyer.type_buyer_fk",
        "CustomBuyer.custom_profile",
        "CustomBuyer.customer_name",
        "district.provice_fk",
        "CustomBuyer.district_fk",
        "CustomBuyer.village_name",
        "CustomBuyer.registra_tel",
        "CustomBuyer.status_changs",
        "CustomBuyer.create_date",
        "district.district_name",
        "district->province.province_name",
      ],
      raw: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in customBuyerPostRoot:", error);
    res.status(400).send();
  }
};

export const customBuyerDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const custom_uuid = req.params.id;
    const insuranceCount = await Insurance.count({ where: { custom_id_fk: custom_uuid } });

    if (insuranceCount > 0) {
      res.status(404).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ" });
      return;
    }

    const data = await CustomBuyer.destroy({ where: { custom_uuid } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
  } catch (error) {
    console.error("Error in customBuyerDeleteById:", error);
    res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const customBuyerPostSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customName } = req.body;
    const data = await CustomBuyer.findAll({
      attributes: [
        "custom_uuid",
        "customer_name",
        "village_name",
        "registra_tel",
        "create_date",
        joinCol("district.district_name"),
        joinCol("district.province.province_name"),
      ],
      where: {
        status_changs: 1,
        customer_name: { [Op.like]: `%${customName || ""}%` },
      },
      include: [joinDistrict()],
      raw: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in customBuyerPostSearch:", error);
    res.status(400).send();
  }
};
