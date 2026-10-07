import { Request, Response } from "express";
import { Op } from "sequelize";
import { Insurance } from "../../models";
import { getPagination, QueryParams } from "../../utils/requestHelpers";
import { dayContract, getContractIncludes, getNewInsuranceInclude, yearBetween } from "../../utils/queryIncludes";

const dayContractAttribute = { include: [[dayContract(), "day_contract"]] as any };

// ສັນຍາທີ່ຕໍ່ອາຍຸແລ້ວ (contract_status = 2) ພ້ອມສັນຍາໃໝ່ (newInsurance)

export const historyReportPostCm = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { years_start, years_end, company_id_fk, insurance_type_fk, type_buyer_fk, option_id_fk } = req.body;

        const whereCondition: any = {
            contract_status: 2,
            [Op.and]: [yearBetween("Insurance.contract_start_date", years_start, years_end)],
        };
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: [
                ...getContractIncludes({ customer: { type_buyer_fk }, option: { insurance_type_fk } }),
                getNewInsuranceInclude(),
            ],
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in historyReportPostCm:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

export const historyReportPostRoport = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { 
            limit, 
            skip, 
            orderBy, 
            order } = getPagination(req.query, "contract_start_date");
        const { years_start, years_end, company_id_fk, insurance_type_fk, agent_id_fk, option_id_fk } = req.body;

        const whereCondition: any = {
            contract_status: 2,
            [Op.and]: [yearBetween("Insurance.contract_start_date", years_start, years_end)],
        };
        if (company_id_fk) whereCondition.company_id_fk = company_id_fk;
        if (agent_id_fk) whereCondition.agent_id_fk = agent_id_fk;
        if (option_id_fk) whereCondition.option_id_fk = option_id_fk;

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: dayContractAttribute,
            where: whereCondition,
            include: [...getContractIncludes({ option: { insurance_type_fk } }), getNewInsuranceInclude()],
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in historyReportPostRoport:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};
