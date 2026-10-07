import { Request, Response, RequestHandler } from "express";
import { Op } from "sequelize";
import moment from "moment";
import multer from "multer";
import path from "path";
import fs from "fs";
import { maxid } from "../../utils";
import { getPagination, QueryParams } from "../../utils/requestHelpers";
import { FilepayRefund, InsuranceReturn } from "../../models";
import {
    asDateTime,
    dateBetween,
    dayBetween,
    getAgentInclude,
    getCompanyInclude,
    getCurrencyInclude,
    getCustomerInclude,
    getOptionInclude,
    getRefundFilesInclude,
    insuranceReturnComputed,
} from "../../utils/queryIncludes";

const now = () => moment().format("YYYY-MM-DD HH:mm:ss");
const formatDate = (value: unknown) => moment(value as any).format("YYYY-MM-DD");

const createUpload = (field: string, folder: string, prefix: string) => {
    let fileName = "";
    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, folder),
        filename: (_req, file, cb) => {
            fileName = `${prefix}${Date.now()}${path.extname(file.originalname)}`;
            cb(null, fileName);
        },
    });
    return { fileName: () => fileName, upload: multer({ storage }).single(field) };
};

const runUpload = (upload: RequestHandler, req: Request, res: Response) =>
    new Promise<void>((resolve, reject) => {
        upload(req, res, (error) => (error ? reject(error) : resolve()));
    });

const removeFile = (filePath: string) =>
    fs.unlink(filePath, (error) => {
        if (error) console.error("Error deleting file:", error);
    });

/** ຖັນວັນທີທີ່ frontend ສົ່ງມາ (datecheck) ຕ້ອງເປັນຖັນຂອງ oac_insurance_retrun ເທົ່ານັ້ນ */
const returnDateColumn = (datecheck: unknown) => {
    const column = String(datecheck ?? "").replace(/^oac_insurance_retrun\./, "");
    return column in InsuranceReturn.getAttributes() ? column : null;
};

/** ສະຖານະການສົ່ງຄືນ: 1 = ບໍລິສັດ, 2 = ຕົວແທນ, 3 = OAC */
const statusColumn = (status: unknown) =>
    ({ 1: "status_company", 2: "status_agent", 3: "status_oac" } as Record<string, string>)[String(status)];

export const insuranceReturnPostCreate = async (req: Request, res: Response): Promise<void> => {
    const uploader = createUpload("file_doc", "./assets/docfile", "retrun-");
    try {
        await runUpload(uploader.upload, req, res);
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
        return;
    }

    const { insurance_retrunId, company_id_fk, agent_id_fk, custom_buyer_id_fk, option_id_fk, contract_number, currency_id_fk, status_company, company_date, percent_agent, status_agent, agent_date, percent_oac, status_oac, oac_date, remark_text } = req.body;
    const fileName = uploader.fileName();
    const fields = {
        company_id_fk,
        agent_id_fk,
        custom_buyer_id_fk,
        option_id_fk,
        contract_number,
        retrun_balance: parseFloat(String(req.body.retrun_balance ?? "").replace(/,/g, "")),
        currency_id_fk,
        status_company,
        company_date: formatDate(company_date),
        percent_agent,
        status_agent,
        agent_date: formatDate(agent_date),
        percent_oac,
        status_oac,
        oac_date: formatDate(oac_date),
        remark_text,
    };

    if (!insurance_retrunId) {
        try {
            const insurance_retrun_id = await maxid(InsuranceReturn, "insurance_retrun_id");
            await InsuranceReturn.create({
                insurance_retrun_id,
                ...fields,
                register_date: asDateTime(now()),
                file_doc: fileName,
            });
            res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", id: String(insurance_retrun_id) });
        } catch (error) {
            console.error("Error inserting data:", error);
            res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
        }
        return;
    }

    try {
        const current = await InsuranceReturn.findByPk(insurance_retrunId, { raw: true });
        const oldFile = current?.file_doc;
        if (oldFile && fileName) removeFile(path.join("assets/docfile/", oldFile));

        const [data] = await InsuranceReturn.update(
            { ...fields, file_doc: fileName || oldFile },
            { where: { insurance_retrun_id: insurance_retrunId } }
        );
        res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ", data });
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ error: "ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ" });
    }
};

export const insuranceReturnPostRetrun = async (req: Request, res: Response): Promise<void> => {
    const uploader = createUpload("file_pay", "./assets/docPay", "rfpay-");
    try {
        await runUpload(uploader.upload, req, res);
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "File upload failed." });
        return;
    }

    const { insurance_retrun_id, status_retrun, retrun_date, remark_text, status_pay } = req.body;
    const status = statusColumn(status_retrun);
    if (!insurance_retrun_id || !status || !retrun_date) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    try {
        const dateColumn = status.replace("status_", "") + "_date";
        await InsuranceReturn.update(
            { [status]: 2, [dateColumn]: formatDate(retrun_date), remark_text },
            { where: { insurance_retrun_id } }
        );
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ error: "Failed to update data." });
        return;
    }

    try {
        await FilepayRefund.create({
            contract_id_fk: insurance_retrun_id,
            status_pay,
            file_doct: uploader.fileName(),
            desciption: remark_text,
            file_dates: asDateTime(now()),
        });
        res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ" });
    } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).json({ message: "ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ" });
    }
};

export const insuranceReturnPostRoot = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "insurance_retrun_id");
        const { start_date, end_date, agentId_fk, companyId_fk, insurance_typeId, custom_buyerId_fk, option_id_fk, status } = req.body;

        const whereCondition: any = {
            [Op.and]: [dayBetween("InsuranceReturn.register_date", formatDate(start_date), formatDate(end_date))],
        };
        if (agentId_fk) whereCondition.agent_id_fk = agentId_fk;
        if (companyId_fk) whereCondition.company_id_fk = companyId_fk;
        if (custom_buyerId_fk) whereCondition.custom_buyer_id_fk = custom_buyerId_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;
        if (status) Object.assign(whereCondition, { status_company: status, status_agent: status, status_oac: status });

        const { rows, count } = await InsuranceReturn.findAndCountAll({
            attributes: { include: insuranceReturnComputed() },
            where: whereCondition,
            include: [
                getCompanyInclude(),
                getAgentInclude(),
                getOptionInclude({ insurance_type_fk: insurance_typeId }),
                getCustomerInclude(),
                getCurrencyInclude(),
                getRefundFilesInclude(),
            ],
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReturnPostRoot:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

export const insuranceReturnPostReport = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "insurance_retrun_id");
        const { status, statusRetrun, datecheck, start_date, end_date, agentId_fk, companyId_fk, insurance_typeId, custom_buyerId_fk, option_id_fk } = req.body;

        const whereCondition: any = { [Op.and]: [] };
        if (start_date && end_date) {
            const dateColumn = returnDateColumn(datecheck);
            if (!dateColumn) {
                res.status(400).json({ error: "datecheck ບໍ່ຖືກຕ້ອງ" });
                return;
            }
            whereCondition[Op.and].push(dateBetween(`InsuranceReturn.${dateColumn}`, formatDate(start_date), formatDate(end_date)));
        }
        if (statusRetrun && statusColumn(status)) whereCondition[statusColumn(status)] = statusRetrun;
        if (agentId_fk) whereCondition.agent_id_fk = agentId_fk;
        if (companyId_fk) whereCondition.company_id_fk = companyId_fk;
        if (custom_buyerId_fk) whereCondition.custom_buyer_id_fk = custom_buyerId_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await InsuranceReturn.findAndCountAll({
            attributes: { include: insuranceReturnComputed() },
            where: whereCondition,
            include: [
                getCompanyInclude(),
                getAgentInclude(),
                getOptionInclude({ insurance_type_fk: insurance_typeId }),
                getCustomerInclude(),
                getCurrencyInclude(),
                getRefundFilesInclude(),
            ],
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReturnPostReport:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

//====================================================================================

export const insuranceReturnDeleteById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const insurance_retrun_id = req.params.id;
    try {
        await InsuranceReturn.destroy({ where: { insurance_retrun_id } });
    } catch (error) {
        console.error("Error delete data:", error);
        res.status(500).json({ error: "ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" });
        return;
    }

    try {
        const files: any[] = await FilepayRefund.findAll({ where: { contract_id_fk: insurance_retrun_id }, raw: true });
        files.forEach((file) => {
            if (file.file_doct) removeFile(`assets/docfile/${file.file_doct}`);
        });
        const data = await FilepayRefund.destroy({ where: { contract_id_fk: insurance_retrun_id } });
        res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ", data });
    } catch (error) {
        console.error("Error delete data:", error);
        res.status(200).json({ message: "ການດຳເນີນງານສຳເລັດແລ້ວ" });
    }
};

export const insuranceReturnGetEditById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const data = await InsuranceReturn.findByPk(req.params.id, { include: [getOptionInclude()] });
        if (!data) {
            res.status(404).json({ error: "ບໍ່ພົບຂໍ້ມູນ" });
            return;
        }
        res.status(200).json({ data });
    } catch (error) {
        console.error("Error in insuranceReturnGetEditById:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

// =============================

/** ສະຖານະການຄືນເງິນ: cm = ບໍລິສັດ, ac = OAC; -1 = ຍັງບໍ່ຈ່າຍ, -2 = ຈ່າຍແລ້ວ */
const refundStatusWhere = (statusRefund: unknown) =>
    ({
        "cm-1": { status_company: 1 },
        "cm-2": { status_company: 2 },
        "ac-1": { status_oac: 1 },
        "ac-2": { status_oac: 2 },
    } as Record<string, object>)[String(statusRefund)] ?? {};

export const insuranceReturnPostCn = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "register_date");
        const { start_date, end_date, companyId_fk, insurance_typeId, option_id_fk, status_refund } = req.body;

        const whereCondition: any = {
            company_id_fk: companyId_fk ?? "",
            ...refundStatusWhere(status_refund),
            [Op.and]: [dayBetween("InsuranceReturn.register_date", formatDate(start_date), formatDate(end_date))],
        };
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await InsuranceReturn.findAndCountAll({
            attributes: { include: insuranceReturnComputed() },
            where: whereCondition,
            include: [
                getCompanyInclude(),
                getAgentInclude(),
                getOptionInclude({ insurance_type_fk: insurance_typeId }),
                getCustomerInclude(),
                getCurrencyInclude(),
            ],
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReturnPostCn:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

// =================

export const insuranceReturnPostReportPay = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { status, statusRetrun, datecheck, start_date, end_date, agentId_fk, companyId_fk, insurance_typeId, option_id_fk } = req.body;
        const dateColumn = returnDateColumn(datecheck);
        if (!dateColumn) {
            res.status(400).json({ error: "datecheck ບໍ່ຖືກຕ້ອງ" });
            return;
        }
        const { limit, skip, orderBy, order } = getPagination(req.query, dateColumn);
        const startDate = start_date ? formatDate(start_date) : "null";
        const endDate = end_date ? formatDate(end_date) : "null";

        const whereCondition: any = {
            [Op.and]: [dateBetween(`InsuranceReturn.${dateColumn}`, startDate, endDate)],
        };
        if (statusRetrun && statusColumn(status)) whereCondition[statusColumn(status)] = statusRetrun;
        if (agentId_fk) whereCondition.agent_id_fk = agentId_fk;
        if (companyId_fk) whereCondition.company_id_fk = companyId_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await InsuranceReturn.findAndCountAll({
            attributes: { include: insuranceReturnComputed({ days: false }) },
            where: whereCondition,
            include: [
                getCompanyInclude(),
                getAgentInclude(),
                getOptionInclude({ insurance_type_fk: insurance_typeId }),
                getCustomerInclude(),
                getCurrencyInclude(),
                getRefundFilesInclude({ status_pay: status }),
            ],
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReturnPostReportPay:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

/** ຄົ້ນຫາໄຟລ໌ຊຳລະເງິນສົ່ງຄືນ ຕາມເລກສັນຍາ */
export const insuranceReturnPostSearch = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "file_id");
        const { contract_number } = req.body;

        const { rows, count } = await FilepayRefund.findAndCountAll({
            include: [
                {
                    association: "insuranceReturn",
                    attributes: ["insurance_retrun_id", "contract_number", "retrun_balance", "remark_text"],
                    where: { contract_number: { [Op.like]: `%${contract_number ?? ""}%` } },
                    required: true,
                    include: [getAgentInclude(), getOptionInclude(), getCompanyInclude(), getCustomerInclude()],
                },
            ],
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReturnPostSearch:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

export const insuranceReturnPostRetrunEdit = async (req: Request, res: Response): Promise<void> => {
    const uploader = createUpload("file_pay", "./assets/docfile", "retrun-");
    try {
        await runUpload(uploader.upload, req, res);
    } catch {
        res.status(400).send();
        return;
    }

    try {
        const { file_id, file_doct, desciption, file_dates } = req.body;
        const fileName = uploader.fileName();
        const replaceFile = Boolean(file_doct && fileName);
        if (replaceFile) removeFile(`./assets/docfile/${file_doct}`);

        await FilepayRefund.update(
            {
                file_doct: replaceFile ? fileName : file_doct,
                desciption,
                file_dates: asDateTime(moment(file_dates).format("YYYY-MM-DD HH:mm:ss")),
            },
            { where: { file_id } }
        );
        res.status(200).json({ message: "ການແກ້ໄຂຂໍ້ມູນສຳເລັດ" });
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ message: "ການແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ" });
    }
};

export const insuranceReturnGetDelFileById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const file_id = req.params.id;
    let fileRecord: any;
    try {
        fileRecord = await FilepayRefund.findByPk(file_id, { raw: true });
    } catch (error) {
        console.error("Error fetching file data:", error);
        res.status(500).json({ error: "Error fetching file data" });
        return;
    }
    if (!fileRecord) {
        res.status(404).json({ error: "No record found" });
        return;
    }

    if (fileRecord.file_doct) removeFile(`./assets/docfile/${fileRecord.file_doct}`);

    try {
        const status = statusColumn(fileRecord.status_pay === 1 || fileRecord.status_pay === 2 ? fileRecord.status_pay : 3);
        await InsuranceReturn.update({ [status]: 1 }, { where: { insurance_retrun_id: fileRecord.contract_id_fk } });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ error: "Failed to update insurance return status" });
        return;
    }

    try {
        await FilepayRefund.destroy({ where: { file_id } });
        res.status(200).json({ message: "File and record deleted successfully" });
    } catch (error) {
        console.error("Error deleting file refund record:", error);
        res.status(500).json({ error: "Failed to delete refund record" });
    }
};
