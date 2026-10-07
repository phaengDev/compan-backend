import { Request, Response, RequestHandler } from "express";
import { Op } from "sequelize";
import moment from "moment";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getPagination, QueryParams } from "../../utils/requestHelpers";
import {
  asDateTime,
  dayBetween,
  fileUrl,
  getActionInclude,
  getAgentInclude,
  getCompanyInclude,
  getCustomerInclude,
  getOptionInclude,
} from "../../utils/queryIncludes";
import { ActionInsurance, DocumentPay } from "../../models";

const createDocPayUpload = () => {
  let fileName = "";
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, "./assets/docPay");
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      fileName = `${Date.now()}${ext}`;
      cb(null, fileName);
    },
  });

  return {
    fileName: () => fileName,
    upload: multer({ storage }).single("docom_file"),
  };
};

const runUpload = (upload: RequestHandler, req: Request, res: Response) =>
  new Promise<void>((resolve, reject) => {
    upload(req, res, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

const paidActionFields = (statusDoc: unknown, docDate: string) => {
  if (String(statusDoc) === "1") {
    return { status_company: 2, company_date: docDate, agent_date: docDate, oac_date: docDate };
  }
  if (String(statusDoc) === "2") {
    return { status_agent: 2, agent_date: docDate };
  }
  return { status_oac: 2, oac_date: docDate };
};

const revertActionFields = (statusDoc: unknown, contractStartDate: string, companyDate: string) => {
  if (String(statusDoc) === "1") {
    return { status_company: 1, company_date: contractStartDate };
  }
  if (String(statusDoc) === "2") {
    return { status_agent: 1, agent_date: companyDate };
  }
  return { status_oac: 1, oac_date: companyDate };
};

export const paysDebtPostCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const uploader = createDocPayUpload();
    await runUpload(uploader.upload, req, res);

    const { contract_code_fk, contract_no, status_pay, status_doc, debt_remark, doccm_date } = req.body;
    const doccmDate = moment(doccm_date).format("YYYY-MM-DD HH:mm:ss");

    const data = await DocumentPay.create({
      contract_code_fk,
      contract_no,
      docom_file: uploader.fileName(),
      status_pay,
      status_doc,
      debt_remark,
      doccm_date: asDateTime(doccmDate),
    });

    await ActionInsurance.update(paidActionFields(status_doc, doccmDate), {
      where: { contract_code_fk },
    });

    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in paysDebtPostCreate:", error);
    res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const paysDebtPostEdit = async (req: Request, res: Response): Promise<void> => {
  try {
    const uploader = createDocPayUpload();
    await runUpload(uploader.upload, req, res);

    const { docoment_id, contract_code_fk, contract_no, status_doc, debt_remark, doccm_date, fileNameck } = req.body;
    const doccmDate = moment(doccm_date).format("YYYY-MM-DD HH:mm:ss");
    const datePays = moment(doccm_date).format("YYYY-MM-DD");
    const uploadedFile = uploader.fileName();

    const [rowsUpdated] = await DocumentPay.update(
      {
        contract_no,
        docom_file: uploadedFile || fileNameck || "",
        debt_remark,
        doccm_date: asDateTime(doccmDate),
      },
      { where: { docoment_id } }
    );

    if (fileNameck && uploadedFile) {
      fs.unlink(`./assets/docPay/${fileNameck}`, (error) => {
        if (error) console.error("Error deleting file:", error);
      });
    }

    const actionUpdate =
      String(status_doc) === "1"
        ? { company_date: datePays }
        : String(status_doc) === "2"
          ? { agent_date: datePays }
          : { oac_date: datePays };

    await ActionInsurance.update(actionUpdate, { where: { contract_code_fk } });
    res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data: rowsUpdated });
  } catch (error) {
    console.error("Error in paysDebtPostEdit:", error);
    res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const paysDebtPostDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docoment_id, contract_code_fk, contract_start_date, company_date, docom_file, status_doc } = req.body;
    const data = await DocumentPay.destroy({ where: { docoment_id } });

    if (docom_file) {
      fs.unlink(`./assets/docPay/${docom_file}`, (error) => {
        if (error) console.error("Error deleting file:", error);
      });
    }

    await ActionInsurance.update(
      revertActionFields(status_doc, contract_start_date, company_date),
      { where: { contract_code_fk } }
    );

    res.status(200).json({ message: "ການລົບຂຂໍ້ມູນສຳເລັດ", data });
  } catch (error) {
    console.error("Error in paysDebtPostDelete:", error);
    res.status(500).json({ error: "ການລົບຂໍ້ມູນບໍ່ສຳເລັດ" });
  }
};

export const paysDebtPostCreateMT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemList, status_pay, status_doc, debt_remark, doccm_date } = req.body;
    const doccmDate = moment(doccm_date).format("YYYY-MM-DD HH:mm:ss");

    await Promise.all(
      (itemList || []).map(async (item: any) => {
        await DocumentPay.create({
          contract_code_fk: item.contract_code_fk,
          contract_no: item.contract_no,
          docom_file: "",
          status_pay,
          status_doc,
          debt_remark,
          doccm_date: asDateTime(doccmDate),
        });

        await ActionInsurance.update(paidActionFields(status_doc, doccmDate), {
          where: { contract_code_fk: item.contract_code_fk },
        });
      })
    );

    res.status(200).json({ message: "ການຕັດໜີ້ໄດ້ສຳເລັດແລ້ວ" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "ການແຊກຂໍ້ມູນລົ້ມເຫລວ" });
  }
};

export const paysDebtPostReport = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
  try {
    const { limit, skip, orderBy, order } = getPagination(req.query, "doccm_date");
    const { status_doc, start_date, end_date, company_id_fk, agent_id_fk, option_id_fk, insurance_type_fk } = req.body;
    const startDate = moment(start_date).format("YYYY-MM-DD");
    const endDate = moment(end_date).format("YYYY-MM-DD");

    const insuranceCondition: any = {};
    if (company_id_fk) insuranceCondition.company_id_fk = company_id_fk;
    if (agent_id_fk) insuranceCondition.agent_id_fk = agent_id_fk;
    if (option_id_fk) insuranceCondition.option_id_fk = option_id_fk;
    const hasInsuranceFilter = Object.keys(insuranceCondition).length > 0 || Boolean(insurance_type_fk);

    const { rows, count } = await DocumentPay.findAndCountAll({
      attributes: { include: [fileUrl("docPay", "docom_file")] },
      where: {
        status_doc: status_doc ?? "",
        [Op.and]: [dayBetween("DocumentPay.doccm_date", startDate, endDate)],
      },
      include: [
        {
          association: "insurance",
          attributes: ["incuranec_code", "contract_number", "contract_start_date", "contract_end_date", "contract_status", "status_check", "status_change", "create_date"],
          where: insuranceCondition,
          required: hasInsuranceFilter,
          include: [
            getCustomerInclude(),
            getActionInclude(undefined, { days: false }),
            getOptionInclude({ insurance_type_fk }),
            getAgentInclude(),
            getCompanyInclude(),
          ],
        },
      ],
      limit,
      offset: skip,
      order: [[orderBy, order]],
      distinct: true,
    });
    res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
  } catch (error) {
    console.error("Error in paysDebtPostReport:", error);
    res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
  }
};

/** ໃບຊຳລະທັງໝົດຂອງສັນຍາ */
export const paysDebtGetContractById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const data = await DocumentPay.findAll({
      attributes: { include: [fileUrl("docPay", "docom_file")] },
      where: { contract_code_fk: req.params.id },
      include: [
        {
          association: "insurance",
          attributes: ["incuranec_code", "contract_number", "contract_start_date", "contract_end_date"],
          include: [getActionInclude(undefined, { days: false })],
        },
      ],
      order: [["status_doc", "ASC"]],
    });
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error in paysDebtGetContractById:", error);
    res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
  }
};
