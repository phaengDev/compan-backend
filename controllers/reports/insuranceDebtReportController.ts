import { Request, Response } from "express";
import { fn, literal, Op } from "sequelize";
import moment from "moment";
import { Insurance } from "../../models";
import { getPagination, QueryParams } from "../../utils/requestHelpers";
import { dayContract, getContractIncludes } from "../../utils/queryIncludes";

const formatDate = (value: unknown) => moment(value as any).format("YYYY-MM-DD");
const dayContractAttribute = { include: [[dayContract(), "day_contract"]] as any };

// ລາຍງານໜີ້: ຍັງບໍ່ຈ່າຍ (status_pay = 1) ຄົ້ນຕາມວັນທີເລີ່ມສັນຍາ, ຈ່າຍແລ້ວຄົ້ນຕາມວັນທີຈ່າຍ

export const insuranceDebtReportPostCompany = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { start_date, end_date, company_id_fk, agent_id_fk, status_pay } = req.body;

        const whereCondition: any = { contract_status: 1 };
        const actionCondition: any = { status_company: status_pay };
        if (start_date && end_date) {
            const between = { [Op.between]: [formatDate(start_date), formatDate(end_date)] };
            if (status_pay === "1") whereCondition.contract_start_date = between;
            else actionCondition.company_date = between;
        }
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk) whereCondition.agent_id_fk = agent_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ action: actionCondition }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceDebtReportPostCompany:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

// ========= pay agent
export const insuranceDebtReportPostAgent = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { start_date, end_date, company_id_fk, agent_id_fk, status_pay, insurance_type_fk, option_id_fk } = req.body;

        const whereCondition: any = { contract_status: 1 };
        const actionCondition: any = { status_agent: status_pay };
        if (start_date && end_date) {
            const between = { [Op.between]: [formatDate(start_date), formatDate(end_date)] };
            if (status_pay === 1) whereCondition.contract_start_date = between;
            else actionCondition.agent_date = between;
        }
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk) whereCondition.agent_id_fk = agent_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ action: actionCondition, option: { insurance_type_fk } }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceDebtReportPostAgent:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

// =============== customer ==========
export const insuranceDebtReportPostCustomer = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { start_date, end_date, company_id_fk, agent_id_fk, custom_id_fk, status_pay } = req.body;

        const whereCondition: any = { contract_status: 1, custom_id_fk: custom_id_fk ?? "" };
        const actionCondition: any = { status_company: status_pay };
        if (start_date && end_date) {
            const between = { [Op.between]: [formatDate(start_date), formatDate(end_date)] };
            if (status_pay === "1") whereCondition.contract_start_date = between;
            else actionCondition.company_date = between;
        }
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk) whereCondition.agent_id_fk = agent_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ action: actionCondition }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceDebtReportPostCustomer:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

// ============= oac borkder
export const insuranceDebtReportPostOac = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { start_date, end_date, company_id_fk, agent_id_fk, status_pay } = req.body;

        const whereCondition: any = { contract_status: 1 };
        const actionCondition: any = { status_oac: status_pay };
        if (start_date && end_date) {
            const between = { [Op.between]: [formatDate(start_date), formatDate(end_date)] };
            if (status_pay === 1) whereCondition.contract_start_date = between;
            else actionCondition.oac_date = between;
        }
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk) whereCondition.agent_id_fk = agent_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ action: actionCondition }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceDebtReportPostOac:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

/** ລວມ (ຈຳນວນເງິນ × ອັດຕາແລກປ່ຽນ) ສະເພາະສັນຍາທີ່ statusColumn = '1' (ຍັງຄ້າງ) */
const sumUnpaid = (statusColumn: string, amountColumn: string) =>
    fn(
        "SUM",
        literal(`CASE WHEN \`action\`.\`${statusColumn}\` = '1' THEN \`action\`.\`${amountColumn}\` * \`action->currency\`.\`reate_price\` ELSE 0 END`)
    );

export const insuranceDebtReportGetSum = async (_req: Request, res: Response): Promise<void> => {
    try {
        const data = await Insurance.findOne({
            attributes: [
                [sumUnpaid("status_oac", "incom_finally"), "incom_finally"],
                [sumUnpaid("status_agent", "expences_pays_taxes"), "expences_pays_taxes"],
                [sumUnpaid("status_company", "insuranc_included"), "insuranc_included"],
            ],
            include: [{ association: "action", attributes: [], include: [{ association: "currency", attributes: [] }] }],
            where: { contract_status: 1 },
            raw: true,
        });
        res.status(200).json({ data });
    } catch (error) {
        console.error("Error in insuranceDebtReportGetSum:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};
