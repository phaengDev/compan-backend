import { Request, Response } from "express";
import { Op, where } from "sequelize";
import moment from "moment";
import { Beneficiary, CarInsurance, Insurance } from "../../models";
import { getPagination, QueryParams } from "../../utils/requestHelpers";
import {
    dayContract,
    getContractIncludes,
    getDistrictInclude,
    userTypeWhere,
    yearBetween,
} from "../../utils/queryIncludes";

const formatDate = (value: unknown) => moment(value as any).format("YYYY-MM-DD");
const dayContractAttribute = { include: [[dayContract(), "day_contract"]] as any };

export const insuranceReportPostAll = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { start_date, end_date, company_id_fk, insurance_type_fk, agent_id_fk, type_buyer_fk, option_id_fk } = req.body;

        const whereCondition: any = {
            contract_status: 1,
            contract_start_date: { [Op.between]: [formatDate(start_date), formatDate(end_date)] },
        };
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk) whereCondition.agent_id_fk = agent_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ customer: { type_buyer_fk }, option: { insurance_type_fk } }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReportPostAll:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

//======================ລາຍງານປະກັນໄພລົດ =========================

export const insuranceReportPostCars = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { start_date, end_date, company_id_fk, insurance_type_fk, agent_id_fk, car_type_id_fk, option_id_fk } = req.body;

        const whereCondition: any = {
            contract_status: 1,
            contract_start_date: { [Op.between]: [formatDate(start_date), formatDate(end_date)] },
        };
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk) whereCondition.agent_id_fk = agent_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;
        if (car_type_id_fk) {
            const cars = await CarInsurance.findAll({ attributes: ["contract_id_fk"], where: { car_type_id_fk }, raw: true });
            whereCondition.incuranec_code = cars.map((car: any) => car.contract_id_fk);
        }

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ option: { insurance_type_fk }, typeInsurance: { status_ins: 2 } }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReportPostCars:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

// ==================== custom buyer ============

export const insuranceReportPostCbuy = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { start_date, end_date, company_id_fk, insurance_type_fk, custom_id_fk, type_buyer_fk, option_id_fk } = req.body;

        const whereCondition: any = {
            contract_status: 1,
            custom_id_fk: custom_id_fk ?? "",
            contract_start_date: { [Op.between]: [formatDate(start_date), formatDate(end_date)] },
        };
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ customer: { type_buyer_fk }, option: { insurance_type_fk } }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReportPostCbuy:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

export const insuranceReportPostHistorybuy = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { years_start, years_end, company_id_fk, insurance_type_fk, custom_id_fk, option_id_fk } = req.body;

        const whereCondition: any = {
            contract_status: 2,
            custom_id_fk: custom_id_fk ?? "",
            [Op.and]: [yearBetween("Insurance.contract_start_date", years_start, years_end)],
        };
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ option: { insurance_type_fk } }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReportPostHistorybuy:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};
// ===========================

export const insuranceReportPostData = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { start_date, end_date, status, statusDay, day_contract, company_id_fk, insurance_type_fk, agent_id_fk, type_buyer_fk, option_id_fk, custom_id_fk, user_type } = req.body;

        const whereCondition: any = { [Op.and]: [] };
        if (status !== undefined && status !== null && status !== "") whereCondition.contract_status = status;
        if (start_date && end_date) {
            whereCondition.contract_end_date = { [Op.between]: [formatDate(start_date), formatDate(end_date)] };
        }
        if (day_contract) {
            const days = statusDay === 1 ? { [Op.between]: [1, Number(day_contract)] } : { [Op.lte]: Number(day_contract) };
            whereCondition[Op.and].push(where(dayContract(), days));
        }
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk && user_type !== 3) whereCondition.agent_id_fk = agent_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;
        if (user_type === 3) whereCondition.custom_id_fk = custom_id_fk ?? "";

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ customer: { type_buyer_fk }, option: { insurance_type_fk } }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReportPostData:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

/** ສັນຍາທີ່ຈະໝົດອາຍຸພາຍໃນ 10 ມື້ */
export const insuranceReportPostNotific = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_end_date");
        const { user_type, companyId } = req.body;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: {
                contract_status: 1,
                ...userTypeWhere(user_type, companyId),
                [Op.and]: [where(dayContract(), { [Op.between]: [1, 10] })],
            },
            include: getContractIncludes(),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReportPostNotific:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

export const insuranceReportPostMove = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { custom_id_fk, company_id_fk, insurance_type_fk, agent_id_fk, option_id_fk } = req.body;

        const whereCondition: any = { contract_status: 1, custom_id_fk: custom_id_fk ?? "" };
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk) whereCondition.agent_id_fk = agent_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: getContractIncludes({ option: { insurance_type_fk } }),
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in insuranceReportPostMove:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

/** ຜູ້ຮັບຜົນປະໂຫຍດຂອງສັນຍາ */
export const insuranceReportGetBeneById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const data = await Beneficiary.findAll({
            where: { insurance_id_fk: req.params.id },
            include: [{ association: "status", attributes: ["stauts_use_id", "status_name"] }, getDistrictInclude()],
            order: [["_id", "ASC"]],
        });
        res.status(200).json({ data });
    } catch (error) {
        console.error("Error in insuranceReportGetBeneById:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

export const insuranceReportPostSearch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { contract_number, typeUse, userUseId } = req.body;
        const data = await Insurance.findOne({
            attributes: dayContractAttribute,
            where: { contract_number: contract_number ?? "", ...userTypeWhere(typeUse, userUseId) },
            include: getContractIncludes(),
        });
        if (!data) {
            res.status(404).json({ error: "ບໍ່ພົບສັນຍາ" });
            return;
        }
        res.status(200).json({ data });
    } catch (error) {
        console.error("Error in insuranceReportPostSearch:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};
