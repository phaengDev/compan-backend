import type { IncludeOptions, ProjectionAlias, WhereOptions } from "sequelize";
import { col, fn, literal, Op, where } from "sequelize";
import { url } from "./index";

type IncludeExtra = Omit<IncludeOptions, "association">;

// ======================== Sequelize include ========================
// getXxxInclude() → ດຶງຂໍ້ມູນມາເປັນ object ຊ້ອນ, ເຊັ່ນ customer.district.province.province_name
// joinXxx()       → join ຢ່າງດຽວ (attributes: []), ໃຊ້ຄູ່ກັບ joinCol() ເພື່ອເອົາຖັນມາໄວ້ລະດັບດຽວກັນ (raw: true)
// ທຸກໂຕເປັນຟັງຊັນ ເພາະ Sequelize ແກ້ໄຂ object ຂອງ include ໂດຍກົງ — ຕ້ອງສ້າງໃໝ່ທຸກຄັ້ງທີ່ໃຊ້

/** ເອົາສະເພາະເງື່ອນໄຂທີ່ມີຄ່າ (ຂ້າມ undefined, null, "", 0): filled({ company_id_fk, agent_id_fk }) */
export const filled = (conditions: Record<string, unknown>): Record<string, any> =>
    Object.fromEntries(Object.entries(conditions).filter(([, value]) => Boolean(value)));

/** ຖ້າມີເງື່ອນໄຂ → ກັ່ນຕອງ ແລະ ເອົາສະເພາະແຖວທີ່ກົງ (required: true); ບໍ່ມີ → ບໍ່ກັ່ນຕອງ */
const filterBy = (conditions?: Record<string, unknown>) => {
    const whereOptions = conditions ? filled(conditions) : {};
    return Object.keys(whereOptions).length ? { where: whereOptions, required: true } : {};
};

/** url ເຕັມຂອງໄຟລ໌: fileUrl("logo", "com_logo") → http://.../image/logo/<com_logo> */
export const fileUrl = (folder: string, column: string): ProjectionAlias => [
    fn("CONCAT", literal(`'${url()}/${folder}/'`), col(column)),
    "url",
];

export const getDistrictInclude = (): IncludeOptions => ({
    association: "district",
    attributes: [
        "district_id",
        "provice_fk",
        "district_name"
    ],
    include: [
        {
            association: "province",
            attributes: [
                "province_id",
                "province_name",
            ]
        }
    ]
});

/** ບໍລິສັດປະກັນໄພ (+ url ໂລໂກ້) */
export const getCompanyInclude = (conditions?: Record<string, unknown>): IncludeOptions => ({
    association: "company",
    attributes: ["company_Id", "com_logo", "com_name_lao", "com_name_eng", "com_tel", "com_address", fileUrl("logo", "com_logo")],
    ...filterBy(conditions),
});

/** ຕົວແທນຂາຍ + ເມືອງ/ແຂວງ */
export const getAgentInclude = (conditions?: Record<string, unknown>): IncludeOptions => ({
    association: "agent",
    attributes: ["agent_Id", "idcrad_code", "agent_name", "agent_dob", "agent_village", "agent_tel", "agent_status"],
    include: [getDistrictInclude()],
    ...filterBy(conditions),
});

/** ລູກຄ້າ + ປະເພດຜູ້ຊື້ + ເມືອງ/ແຂວງ (+ url ຮູບ) */
export const getCustomerInclude = (conditions?: Record<string, unknown>): IncludeOptions => ({
    association: "customer",
    attributes: [
        "custom_uuid",
        "customer_name",
        "custom_profile",
        "village_name",
        "registra_tel",
        "type_buyer_fk",
        "district_fk",
        "status_changs",
        fileUrl("profile", "custom_profile"),
    ],
    include: [{ association: "typeBuyer", attributes: ["type_buyer_id", "type_buyer_name"] }, getDistrictInclude()],
    ...filterBy(conditions),
});

/** ທາງເລືອກ + ປະເພດປະກັນໄພ — typeConditions ກັ່ນຕອງຕາມປະເພດ, ເຊັ່ນ { status_ins: 2 } */
export const getOptionInclude = (
    conditions?: Record<string, unknown>,
    typeConditions?: Record<string, unknown>
): IncludeOptions => {
    const typeFilter = filterBy(typeConditions);
    return {
        association: "option",
        attributes: ["options_Id", "options_name", "insurance_type_fk", "option_vat"],
        include: [{ association: "typeInsurance", attributes: ["type_insid", "type_in_name", "status_ins"], ...typeFilter }],
        ...filterBy(conditions),
        ...("required" in typeFilter ? { required: true } : {}),
    };
};

/** ສະກຸນເງິນ */
export const getCurrencyInclude = (): IncludeOptions => ({
    association: "currency",
    attributes: ["currency_id", "currency_name", "genus", "reate_price"],
});

/**
 * ຂໍ້ມູນເງິນຂອງສັນຍາ (oac_action_insurance) + ສະກຸນເງິນ
 * days: true → ເພີ່ມ day_company, day_agent, day_oac (ໃຊ້ໄດ້ສະເພາະເມື່ອ include ຢູ່ໃຕ້ Insurance ໂດຍກົງ)
 */
export const getActionInclude = (conditions?: Record<string, unknown>, { days = true } = {}): IncludeOptions => ({
    association: "action",
    attributes: days
        ? {
            include: [
                [daysSince("action.company_date"), "day_company"],
                [daysSince("action.agent_date"), "day_agent"],
                [daysSince("action.oac_date"), "day_oac"],
            ],
        }
        : undefined,
    include: [getCurrencyInclude()],
    ...filterBy(conditions),
});

/** ລົດທີ່ເອົາປະກັນ + ປະເພດ/ຍີ່ຫໍ້ລົດ */
export const getCarsInclude = (): IncludeOptions => ({
    association: "cars",
    separate: true,
    include: [
        { association: "typeCar", attributes: ["typecar_Id", "typecar_name"] },
        { association: "brand", attributes: ["brands_Id", "brands_name"] },
    ],
});

/** ເອກະສານສັນຍາ (+ url) */
export const getDocumentsInclude = (): IncludeOptions => ({
    association: "documents",
    separate: true,
    attributes: { include: [fileUrl("docfile", "file_insurance")] },
    order: [["file_doc_id", "ASC"]],
});

/** ໃບຊຳລະໜີ້ (+ url) */
export const getPaymentsInclude = (): IncludeOptions => ({
    association: "payments",
    separate: true,
    attributes: { include: [fileUrl("docPay", "docom_file")] },
    order: [["docoment_id", "ASC"]],
});

/** ຜູ້ຮັບຜົນປະໂຫຍດ + ສະຖານະ + ເມືອງ/ແຂວງ */
export const getBeneficiariesInclude = (): IncludeOptions => ({
    association: "beneficiaries",
    separate: true,
    include: [{ association: "status", attributes: ["stauts_use_id", "status_name"] }, getDistrictInclude()],
    order: [["_id", "ASC"]],
});

type ContractFilters = {
    customer?: Record<string, unknown>;
    action?: Record<string, unknown>;
    option?: Record<string, unknown>;
    typeInsurance?: Record<string, unknown>;
};

/**
 * ທຸກຂໍ້ມູນທີ່ກ່ຽວຂ້ອງຂອງສັນຍາ: ລູກຄ້າ, ເງິນ, ທາງເລືອກ/ປະເພດ, ຕົວແທນ, ບໍລິສັດ, ລົດ, ເອກະສານ, ໃບຊຳລະ, ຜູ້ຮັບຜົນປະໂຫຍດ
 * ເຊັ່ນ: Insurance.findAndCountAll({ include: getContractIncludes({ option: { insurance_type_fk } }) })
 */
export const getContractIncludes = (filters: ContractFilters = {}): IncludeOptions[] => [
    getCustomerInclude(filters.customer),
    getActionInclude(filters.action),
    getOptionInclude(filters.option, filters.typeInsurance),
    getAgentInclude(),
    getCompanyInclude(),
    getCarsInclude(),
    getDocumentsInclude(),
    getPaymentsInclude(),
    getBeneficiariesInclude(),
];

/** ສັນຍາໃໝ່ທີ່ຕໍ່ອາຍຸຈາກສັນຍານີ້ */
export const getNewInsuranceInclude = (): IncludeOptions => ({
    association: "newInsurance",
    attributes: ["incuranec_code", "contract_number", "contract_start_date", "contract_end_date"],
});

/** ໄຟລ໌ຊຳລະເງິນສົ່ງຄືນ (tbl_filepay_refund) — conditions ກັ່ນຕອງສະເພາະໄຟລ໌ ບໍ່ກັ່ນຕອງລາຍການສົ່ງຄືນ */
export const getRefundFilesInclude = (conditions?: Record<string, unknown>): IncludeOptions => ({
    association: "refundFiles",
    separate: true,
    ...(conditions ? { where: filled(conditions) } : {}),
    order: [["file_id", "ASC"]],
});

/** ຖັນທີ່ຄິດໄລ່ຂອງການສົ່ງຄືນ: ຈຳນວນມື້ ແລະ ເງິນຂອງຕົວແທນ/OAC */
export const insuranceReturnComputed = ({ days = true } = {}): ProjectionAlias[] => [
    ...(days ? [[daysSince("InsuranceReturn.company_date"), "day_cpn"] as ProjectionAlias] : []),
    [literal("`InsuranceReturn`.`retrun_balance` * `InsuranceReturn`.`percent_agent` / 100"), "balance_agent"],
    ...(days ? [[daysSince("InsuranceReturn.agent_date"), "day_agent"] as ProjectionAlias] : []),
    [literal("`InsuranceReturn`.`retrun_balance` * `InsuranceReturn`.`percent_oac` / 100"), "balance_oac"],
    ...(days ? [[daysSince("InsuranceReturn.oac_date"), "day_oac"] as ProjectionAlias] : []),
];

// ---- join ຢ່າງດຽວ (ໃຊ້ກັບ raw: true + joinCol) ----

/** joinCol("company.com_name_lao") → [col("company.com_name_lao"), "com_name_lao"] */
export const joinCol = (path: string, alias = path.split(".").pop() as string): ProjectionAlias => [col(path), alias];

/** ເມືອງ + ແຂວງ: joinCol("district.district_name"), joinCol("district.province.province_name") */
export const joinDistrict = (): IncludeOptions => ({
    association: "district",
    attributes: [],
    include: [{ association: "province", attributes: [] }],
});

/** ບໍລິສັດປະກັນໄພ: joinCol("company.com_name_lao") */
export const joinCompany = (extra: IncludeExtra = {}): IncludeOptions => ({
    association: "company",
    attributes: [],
    ...extra,
});

/** ຕົວແທນຂາຍ: joinCol("agent.agent_name") */
export const joinAgent = (extra: IncludeExtra = {}): IncludeOptions => ({
    association: "agent",
    attributes: [],
    ...extra,
});

/** ລູກຄ້າ: joinCol("customer.customer_name") */
export const joinCustomer = (extra: IncludeExtra = {}): IncludeOptions => ({
    association: "customer",
    attributes: [],
    ...extra,
});

/** ພະແນກ: joinCol("department.departName") */
export const joinDepartment = (extra: IncludeExtra = {}): IncludeOptions => ({
    association: "department",
    attributes: [],
    ...extra,
});

/** ປະເພດປະກັນໄພ: joinCol("typeInsurance.type_in_name") */
export const joinTypeInsurance = (extra: IncludeExtra = {}): IncludeOptions => ({
    association: "typeInsurance",
    attributes: [],
    ...extra,
});

/**
 * ກັ່ນຕອງດ້ວຍສັນຍາປະກັນໄພ — ເອົາສະເພາະແຖວທີ່ມີສັນຍາ (required: true ເປັນຄ່າເລີ່ມຕົ້ນ)
 * ເຊັ່ນ: joinInsurances({ where: { custom_id_fk: id } })
 */
export const joinInsurances = (extra: IncludeExtra = {}): IncludeOptions => ({
    association: "insurances",
    attributes: [],
    required: true,
    ...extra,
});

// ======================== ຟັງຊັນ SQL ທີ່ໃຊ້ເລື້ອຍ ========================

/** ຈຳນວນມື້ນັບແຕ່ວັນທີ (path) ຮອດມື້ນີ້: daysSince("action.company_date") */
export const daysSince = (path: string) => fn("DATEDIFF", fn("CURDATE"), col(path));

/** ຈຳນວນມື້ທີ່ເຫຼືອກ່ອນສັນຍາໝົດ (ໃຊ້ກັບ Insurance.findAll) */
export const dayContract = () => fn("DATEDIFF", col("Insurance.contract_end_date"), fn("CURDATE"));

/**
 * ບັນທຶກວັນທີ-ເວລາ (ຖັນ DataTypes.DATE) ຕາມທີ່ຂຽນມາ ເຊັ່ນ "2026-10-05 15:00:00"
 * ຖ້າສົ່ງ string ໃຫ້ Sequelize ໂດຍກົງ ມັນຈະປ່ຽນເປັນ UTC ກ່ອນບັນທຶກ (15:00 → 08:00) ບໍ່ກົງກັບຂໍ້ມູນເກົ່າ
 */
export const asDateTime = (value: string) => fn("TIMESTAMP", value);

/** ຖັນວັນທີ BETWEEN start ແລະ end: dateBetween("InsuranceReturn.company_date", start, end) */
export const dateBetween = (path: string, start: string, end: string) =>
    where(col(path), { [Op.between]: [start, end] });

/** ສະເພາະວັນທີ (ຕັດເວລາອອກ) BETWEEN start ແລະ end — ໃຊ້ກັບຖັນ DataTypes.DATE */
export const dayBetween = (path: string, start: string, end: string) =>
    where(fn("DATE", col(path)), { [Op.between]: [start, end] });

/** ປີຂອງວັນທີ BETWEEN start ແລະ end: yearBetween("Insurance.contract_start_date", 2024, 2025) */
export const yearBetween = (path: string, start: unknown, end: unknown) =>
    where(fn("YEAR", col(path)), { [Op.between]: [start, end] });

/** ປີຂອງວັນທີ = ປີປັດຈຸບັນ */
export const isThisYear = (path: string) => where(fn("YEAR", col(path)), fn("YEAR", fn("CURDATE")));

/** ເງື່ອນໄຂຕາມປະເພດຜູ້ໃຊ້: 2 = ຕົວແທນ, 3 = ລູກຄ້າ, 4 = ບໍລິສັດ */
export const userTypeWhere = (userType: unknown, id: unknown): WhereOptions => {
    if (userType === 2) return { agent_id_fk: id };
    if (userType === 3) return { custom_id_fk: id };
    if (userType === 4) return { company_id_fk: id };
    return {};
};
