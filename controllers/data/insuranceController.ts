import { Request, Response, RequestHandler } from "express";
import { Op } from "sequelize";
import moment from "moment";
import multer from "multer";
import path from "path";
import fs from "fs";
import { maxid } from "../../utils";
import { getPagination, QueryParams } from "../../utils/requestHelpers";
import {
  asDateTime,
  dayContract,
  getAgentInclude,
  getBeneficiariesInclude,
  getCompanyInclude,
  getContractIncludes,
  getDocumentsInclude,
  getOptionInclude,
} from "../../utils/queryIncludes";
import {
  ActionInsurance,
  Beneficiary,
  CarInsurance,
  DocInsurance,
  DocumentPay,
  Insurance,
} from "../../models";

const dateTime = moment().format("YYYY-MM-DD HH:mm:ss");

const parseMoney = (value: unknown) => Number(String(value ?? "0").replace(/,/g, "")) || 0;
const formatDate = (value: unknown) => (value ? moment(value as any).format("YYYY-MM-DD") : null);

const createInsuranceUpload = () => {
  let fileName = "";
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, "./assets/docfile");
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      fileName = `file-${Date.now()}${ext}`;
      cb(null, fileName);
    },
  });

  return {
    fileName: () => fileName,
    upload: multer({ storage }).single("file_doct"),
  };
};

const runUpload = (upload: RequestHandler, req: Request, res: Response) =>
  new Promise<void>((resolve, reject) => {
    upload(req, res, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

const financialFields = (body: any) => {
  const percent_taxes = Number(body.percent_taxes) || 0;
  const precent_incom = Number(body.precent_incom) || 0;
  const percent_akorn = Number(body.percent_akorn) || 0;
  const percent_eps = Number(body.percent_eps) || 0;
  const percent_fee_eps = Number(body.percent_fee_eps) || 0;
  const initial_fee = parseMoney(body.initial_fee);
  const money_taxes = (initial_fee * percent_taxes) / 100;
  const registration_fee = parseMoney(body.registration_fee);
  const insuranc_included = parseMoney(body.insuranc_included);
  const pre_tax_profit = (initial_fee * precent_incom) / 100;
  const incom_money = (pre_tax_profit * percent_akorn) / 100;
  const incom_finally = pre_tax_profit - incom_money;
  const pays_advance_fee = (initial_fee * percent_eps) / 100;
  const money_percent_fee = (pays_advance_fee * percent_fee_eps) / 100;
  const expences_pays_taxes = pays_advance_fee - money_percent_fee;
  const net_income = incom_finally - expences_pays_taxes;

  return {
    currency_id_fk: body.currency_id_fk,
    initial_fee,
    percent_taxes,
    money_taxes,
    registration_fee,
    insuranc_included,
    precent_incom,
    pre_tax_profit,
    percent_akorn,
    incom_money,
    incom_finally,
    percent_eps,
    pays_advance_fee,
    percent_fee_eps,
    money_percent_fee,
    expences_pays_taxes,
    net_income,
    status_company: body.status_company,
    company_date: formatDate(body.company_date),
    status_agent: body.status_agent,
    agent_date: formatDate(body.agent_date),
    status_oac: body.status_oac,
    oac_date: formatDate(body.oac_date),
  };
};

const insuranceFields = (body: any) => ({
  custom_id_fk: body.custom_id_fk,
  company_id_fk: body.company_id_fk,
  agent_id_fk: body.agent_id_fk,
  option_id_fk: body.option_id_fk,
  contract_number: body.contract_number,
  contract_start_date: formatDate(body.contract_start_date),
  contract_end_date: formatDate(body.contract_end_date),
  contract_status: 1,
  status_check: 1,
  status_change: 1,
});

const carFields = (contractCode: string, body: any) => ({
  contract_id_fk: contractCode,
  car_type_id_fk: body.car_type_id_fk,
  car_brand_id_fk: body.car_brand_id_fk,
  version_name: body.version_name,
  car_registration: body.car_registration,
  vehicle_number: body.vehicle_number,
  tank_number: body.tank_number,
  createcar_date: asDateTime(dateTime),
});

const beneficiaryFields = (contractCode: string, body: any) => ({
  insurance_id_fk: contractCode,
  no_contract: body.no_contract,
  user_fname: body.user_fname,
  user_lname: body.user_lname,
  user_gender: body.user_gender,
  user_dob: body.user_dob ? moment(body.user_dob).format("YYYY-MM-DD") : "",
  user_tel: body.user_tel,
  user_district_fk: body.user_district_fk,
  user_village: body.user_village,
  status_use: body.status_use,
});

const createRelatedInsuranceData = async (contractCode: string, body: any, fileName: string) => {
  if (String(body.statusIns) === "2") {
    const cars_code = String(await maxid(CarInsurance, "cars_code"));
    await CarInsurance.create({ cars_code, ...carFields(contractCode, body) });
  }

  if (fileName) {
    await DocInsurance.create({
      contract_code_fk: contractCode,
      file_insurance: fileName,
      create_date: asDateTime(dateTime),
    });
  }

  const actionId = String(await maxid(ActionInsurance, "actionId"));
  await ActionInsurance.create({
    actionId,
    contract_code_fk: contractCode,
    ...financialFields(body),
  });

  if (body.user_fname) {
    await Beneficiary.create(beneficiaryFields(contractCode, body));
  }
};

export const insurancePostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const uploader = createInsuranceUpload();
    await runUpload(uploader.upload, req, res);
    const body = req.body;
    const fileName = uploader.fileName();

    if (!body.incuranecCode) {
      const exists = await Insurance.findOne({ where: { contract_number: body.contract_number } });
      if (exists) {
        res.status(201).json({ message: "ສັນຍານີ້ມີໃນລະບົບແລ້ວ" });
        return;
      }

      const incuranec_code = String(await maxid(Insurance, "incuranec_code"));
      const data = await Insurance.create({
        incuranec_code,
        ...insuranceFields(body),
        create_date: asDateTime(dateTime),
      });
      await createRelatedInsuranceData(incuranec_code, body, fileName);

      res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
      return;
    }

    if (body.contract_number !== body.contract_number2) {
      const exists = await Insurance.findOne({ where: { contract_number: body.contract_number } });
      if (exists) {
        res.status(201).json({ message: "ສັນຍານີ້ມີໃນລະບົບແລ້ວ" });
        return;
      }
    }

    const contractCode = body.incuranecCode;
    const [rowsUpdated] = await Insurance.update(insuranceFields(body), {
      where: { incuranec_code: contractCode },
    });

    if (String(body.statusIns) === "2") {
      const car = await CarInsurance.findOne({ where: { contract_id_fk: contractCode } });
      if (car) {
        await CarInsurance.update(carFields(contractCode, body), { where: { contract_id_fk: contractCode } });
      } else {
        const cars_code = String(await maxid(CarInsurance, "cars_code"));
        await CarInsurance.create({ cars_code, ...carFields(contractCode, body) });
      }
    }

    if (fileName) {
      await DocInsurance.create({
        contract_code_fk: contractCode,
        file_insurance: fileName,
        create_date: asDateTime(dateTime),
      });
    }

    await ActionInsurance.update(financialFields(body), { where: { contract_code_fk: contractCode } });
    const data = await Insurance.findOne({ where: { incuranec_code: contractCode } });
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data: data || rowsUpdated });
  } catch (error) {
    console.error("Error in insurancePostCreate:", error);
    res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
  }
};

export const insurancePostRenew = async (req: Request, res: Response): Promise<void> => {
  try {
    const uploader = createInsuranceUpload();
    await runUpload(uploader.upload, req, res);
    const body = req.body;
    const oldContractCode = body.incuranecCode;
    const newContractCode = String(await maxid(Insurance, "incuranec_code"));

    const data = await Insurance.create({
      incuranec_code: newContractCode,
      ...insuranceFields(body),
      create_date: asDateTime(dateTime),
    });
    await createRelatedInsuranceData(newContractCode, body, uploader.fileName());

    const oldBeneficiaries = await Beneficiary.findAll({ where: { insurance_id_fk: oldContractCode } });
    await Promise.all(
      oldBeneficiaries.map((beneficiary) => {
        const plain = beneficiary.get({ plain: true }) as any;
        delete plain._id;
        plain.insurance_id_fk = newContractCode;
        return Beneficiary.create(plain);
      })
    );

    await Insurance.update(
      { insurance_new_id: newContractCode, contract_status: 2 },
      { where: { incuranec_code: oldContractCode } }
    );

    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in insurancePostRenew:", error);
    res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
  }
};

export const insuranceGetById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await Insurance.findOne({
      attributes: { include: [[dayContract(), "day_contract"]] },
      where: { incuranec_code: req.params.id },
      include: getContractIncludes(),
    });
    if (!data) {
      res.status(404).json({ error: "ບໍ່ພົບສັນຍາ" });
      return;
    }
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error in insuranceGetById:", error);
    res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
  }
};

export const insurancePostSearch = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
  try {
    const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
    const { contract_number } = req.body;
    const { rows, count } = await Insurance.findAndCountAll({
      attributes: ["incuranec_code", "contract_number", "contract_start_date", "contract_end_date"],
      where: {
        contract_status: 1,
        contract_number: { [Op.like]: `%${contract_number || ""}%` },
      },
      include: [getBeneficiariesInclude(), getOptionInclude(), getAgentInclude(), getCompanyInclude()],
      limit,
      offset: skip,
      order: [[orderBy, order]],
      distinct: true,
    });
    res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
  } catch (error) {
    console.error("Error in insurancePostSearch:", error);
    res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
  }
};

export const insurancePostMovedata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contract_end, contract_start } = req.body;
    if (!Array.isArray(contract_start)) {
      res.status(400).json({ message: "ຂໍ້ມູນ ສັນຍາທີ່ຕ້ອງການຍ້າຍ ບໍ່ຖືກຕ້ອງ" });
      return;
    }

    const data = await Promise.all(
      contract_start.map((item: any) =>
        Insurance.update(
          { custom_id_fk: contract_end },
          { where: { incuranec_code: item.incuranec_code } }
        )
      )
    );
    res.status(200).json({ message: "ການຍ້າຍຂໍ້ມູນ ໄດ້ສຳເລັດ", data });
  } catch (error) {
    console.error("Error in insurancePostMovedata:", error);
    res.status(500).json({ message: "ການແຊກຂໍ້ມູນລົ້ມເຫລວ" });
  }
};

/** ສັນຍາທີ່ຍັງໃຊ້ງານຂອງລູກຄ້າ */
export const insuranceGetViewBuyById = async (req: Request<{ id: string }, {}, any, QueryParams>, res: Response): Promise<void> => {
  try {
    const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
    const { rows, count } = await Insurance.findAndCountAll({
      attributes: ["incuranec_code", "contract_number", "contract_start_date", "contract_end_date"],
      where: { contract_status: 1, custom_id_fk: req.params.id },
      include: [getAgentInclude(), getCompanyInclude(), getOptionInclude(), getDocumentsInclude()],
      limit,
      offset: skip,
      order: [[orderBy, order]],
      distinct: true,
    });
    res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
  } catch (error) {
    console.error("Error in insuranceGetViewBuyById:", error);
    res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
  }
};

export const insuranceDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const insuranceId = req.params.id;
    const docs = await DocInsurance.findAll({ where: { contract_code_fk: insuranceId } });
    await Promise.all(
      docs.map(async (doc) => {
        const fileName = (doc as any).file_insurance;
        if (fileName) {
          await fs.promises.unlink(path.join("assets/docfile", fileName)).catch(() => undefined);
        }
      })
    );

    await Insurance.destroy({ where: { incuranec_code: insuranceId } });
    await ActionInsurance.destroy({ where: { contract_code_fk: insuranceId } });
    await CarInsurance.destroy({ where: { contract_id_fk: insuranceId } });
    await DocInsurance.destroy({ where: { contract_code_fk: insuranceId } });
    await DocumentPay.destroy({ where: { contract_code_fk: insuranceId } });
    await Beneficiary.destroy({ where: { insurance_id_fk: insuranceId } });

    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "ການລົບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const insurancePostAddbene = async (req: Request, res: Response): Promise<void> => {
  try {
    const { insurance_id_fk, statuStaff } = req.body;
    const data = (Array.isArray(statuStaff) ? statuStaff : []).map((item: any) => ({
      insurance_id_fk,
      no_contract: item.no_contract,
      user_fname: item.user_fname,
      user_lname: item.user_lname,
      user_gender: item.user_gender,
      user_dob: item.user_dob ? moment(item.user_dob).format("YYYY-MM-DD") : "",
      user_tel: item.user_tel,
      user_district_fk: item.user_district_fk,
      user_village: item.user_village,
      status_use: item.status_use,
    }));

    if (data.length > 0) {
      await Beneficiary.bulkCreate(data);
    }
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "ການແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const insurancePostEditbene = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      _id,
      no_contract,
      user_fname,
      user_lname,
      user_gender,
      user_dob,
      user_tel,
      user_district_fk,
      user_village,
      status_use,
    } = req.body;

    const [rowsUpdated] = await Beneficiary.update(
      { no_contract, user_fname, user_lname, user_gender, user_dob, user_tel, user_district_fk, user_village, status_use },
      { where: { _id } }
    );
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data: rowsUpdated });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ" });
  }
};

export const insuranceDeleteBeneById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    await Beneficiary.destroy({ where: { _id: req.params.id } });
    res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ" });
  } catch (error) {
    console.error("Error doc insurance data:", error);
    res.status(500).json({ error: "ການລົບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const insurancePostContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractNumber, statusUse } = req.body;
    const data = await Insurance.findAll({
      where: {
        contract_number: { [Op.like]: `%${contractNumber || ""}%` },
        contract_status: statusUse,
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in insurancePostContract:", error);
    res.status(400).send();
  }
};
