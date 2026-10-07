import { Request, Response } from "express";
import { col, fn, literal, Op, where, WhereOptions } from "sequelize";
import moment from "moment";
import { CustomBuyer, Insurance } from "../../models";
import { getPagination, QueryParams } from "../../utils/requestHelpers";
import { dayContract, getCustomerInclude, isThisYear, userTypeWhere } from "../../utils/queryIncludes";

const actionCurrencyInclude = () => [
    { association: "action", attributes: [], include: [{ association: "currency", attributes: [] }] },
];

/** ລວມ (ຖັນໃນ oac_action_insurance × ອັດຕາແລກປ່ຽນ), ບໍ່ມີຂໍ້ມູນ = 0 */
const sumAction = (column: string) =>
    fn("COALESCE", fn("SUM", literal(`\`action\`.\`${column}\` * \`action->currency\`.\`reate_price\``)), 0);

export const homeReportPostBalanch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_type, companyId } = req.body;
        const activeWhere = { contract_status: 1, ...userTypeWhere(user_type, companyId) };

        const [totals, qtyAll, run_out, qty_almost, custom_qty] = await Promise.all([
            Insurance.findOne({
                attributes: [
                    [fn("ROUND", sumAction("insuranc_included")), "insuranc_included"],
                    [fn("ROUND", sumAction("incom_finally")), "incom_finally"],
                    [fn("ROUND", sumAction("expences_pays_taxes")), "expences_pays_taxes"],
                    [fn("ROUND", sumAction("net_income")), "net_income"],
                ],
                include: actionCurrencyInclude(),
                where: { ...activeWhere, [Op.and]: [isThisYear("Insurance.contract_start_date")] },
                raw: true,
            }),
            Insurance.count({ where: activeWhere }),
            Insurance.count({ where: { ...activeWhere, [Op.and]: [where(dayContract(), { [Op.lte]: 1 })] } }),
            Insurance.count({ where: { ...activeWhere, [Op.and]: [where(dayContract(), { [Op.between]: [1, 10] })] } }),
            CustomBuyer.count({ where: { status_changs: 1 } }),
        ]);

        res.status(200).json({
            data: {
                ...(totals as any),
                arrears_commit: (totals as any)?.expences_pays_taxes,
                qtyAll,
                run_out,
                qty_almost,
                custom_qty,
            },
        });
    } catch (error) {
        console.error("Error in homeReportPostBalanch:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};

/**
 * ລວມຍອດແຕ່ລະເດືອນຂອງປີນີ້ (ເດືອນ 1–12) ສຳລັບກຣາຟ
 * ເດືອນທີ່ບໍ່ມີຂໍ້ມູນ ໃຫ້ຄ່າ "0.00" ຄືກັບເດືອນອື່ນທີ່ MySQL ສົ່ງມາ
 */
const monthlyTotals = async (filter: WhereOptions, columns: string[]) => {
    const month = fn("MONTH", col("Insurance.contract_start_date"));
    const rows: any[] = await Insurance.findAll({
        attributes: [[month, "MonthNumber"], ...columns.map((column) => [sumAction(column), column] as [any, string])],
        include: actionCurrencyInclude(),
        where: { contract_status: 1, ...filter, [Op.and]: [isThisYear("Insurance.contract_start_date")] },
        group: [month],
        raw: true,
    });
    const byMonth = new Map(rows.map((row) => [Number(row.MonthNumber), row]));
    return (column: string) => Array.from({ length: 12 }, (_, i) => byMonth.get(i + 1)?.[column] ?? "0.00");
};

// API Endpoint to fetch chart data
export const homeReportGetGetChartData = async (_req: Request, res: Response): Promise<void> => {
    try {
        const data = await monthlyTotals({}, ["insuranc_included", "incom_finally", "expences_pays_taxes", "net_income"]);
        res.status(200).json({
            series: [
                { name: "ລວມຍອດຂາຍ", data: data("insuranc_included") },
                { name: "ຄອມຮັບ", data: data("incom_finally") },
                { name: "ຄອມຈ່າຍ", data: data("expences_pays_taxes") },
                { name: "ຄອມຮັບສຸດທິ", data: data("net_income") },
            ],
        });
    } catch (error) {
        console.error("Error in homeReportGetGetChartData:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};

// ============== company insurance============

export const homeReportGetGetChartCnById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const data = await monthlyTotals({ company_id_fk: req.params.id }, ["insuranc_included", "incom_finally"]);
        res.status(200).json({
            series: [
                { name: "ລວມຍອດຂາຍ", data: data("insuranc_included") },
                { name: "ຄອມຈ່າຍ", data: data("incom_finally") },
            ],
        });
    } catch (error) {
        console.error("Error in homeReportGetGetChartCnById:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};

// API Endpoint to fetch chart data
export const homeReportGetChartAgentById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const data = await monthlyTotals({ agent_id_fk: req.params.id }, ["insuranc_included", "expences_pays_taxes"]);
        res.status(200).json({
            series: [
                { name: "ລວມຍອດຂາຍ", data: data("insuranc_included") },
                { name: "ຄອມຮັບ", data: data("expences_pays_taxes") },
            ],
        });
    } catch (error) {
        console.error("Error in homeReportGetChartAgentById:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};

// API Endpoint to fetch chart data
export const homeReportGetChartBuyById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const data = await monthlyTotals({ custom_id_fk: req.params.id }, ["insuranc_included"]);
        res.status(200).json({ series: [{ name: "ລວມຍອດຊື້ປະກັນ", data: data("insuranc_included") }] });
    } catch (error) {
        console.error("Error in homeReportGetChartBuyById:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};

/** ສັນຍາທີ່ຈ່າຍໜີ້ມື້ນີ້ (ຕົວແທນ ຫຼື ບໍລິສັດ) */
export const homeReportPostPaydebt = async (req: Request<{}, {}, any, QueryParams>, res: Response): Promise<void> => {
    try {
        const { limit, skip, orderBy, order } = getPagination(req.query, "contract_start_date");
        const { user_type, companyId } = req.body;
        const today = moment().format("YYYY-MM-DD");

        const whereCondition: any = { contract_status: 1 };
        const actionInclude: any = { association: "action", attributes: ["status_agent", "agent_date", "status_company", "company_date"] };
        if (user_type === 2) {
            whereCondition.agent_id_fk = companyId;
            Object.assign(actionInclude, { where: { status_agent: 2, agent_date: today }, required: true });
        } else if (user_type === 4) {
            whereCondition.company_id_fk = companyId;
            Object.assign(actionInclude, { where: { status_company: 2, company_date: today }, required: true });
        }

        const { rows, count } = await Insurance.findAndCountAll({
            attributes: ["incuranec_code", "contract_number"],
            where: whereCondition,
            include: [getCustomerInclude(), actionInclude],
            limit,
            offset: skip,
            order: [[orderBy, order]],
            distinct: true,
        });
        res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } });
    } catch (error) {
        console.error("Error in homeReportPostPaydebt:", error);
        res.status(500).json({ error: "ການສະແດງຂໍ້ມູນລົ້ມເຫຼວ" });
    }
};
