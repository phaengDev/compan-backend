const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');

router.post("/cm", function (req, res) {
    const { years_start, years_end, company_id_fk, insurance_type_fk, type_buyer_fk, option_id_fk } = req.body;
    let companyId_fk = '';
    if (company_id_fk) {
        companyId_fk = `AND view_insurance_all.company_id_fk='${company_id_fk}'`;
    }
    let insurance_typeId = '';
    if (insurance_type_fk) {
        insurance_typeId = `AND view_insurance_all.insurance_type_fk='${insurance_type_fk}'`;
    }
  
    let type_buyerId = '';
    if (type_buyer_fk) {
        type_buyerId = `AND view_insurance_all.type_buyer_fk='${type_buyer_fk}'`;
    }
    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND view_insurance_all.option_id_fk='${option_id_fk}'`;
    }

    let conditions = `${companyId_fk} ${insurance_typeId} ${type_buyerId} ${optionId_fk}`;

    const tables = `view_insurance_all
    LEFT JOIN oac_insurance ON view_insurance_all.insurance_new_id=oac_insurance.incuranec_code `;
    const fields = `view_insurance_all.*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto,
    oac_insurance.contract_number AS contract_numbers,
    oac_insurance.contract_start_date AS contract_start_dates,
    oac_insurance.contract_end_date AS contract_end_dates`;
    const wheres = `view_insurance_all.contract_status='2' AND YEAR( view_insurance_all.contract_start_date) BETWEEN '${years_start}' AND '${years_end}' ${conditions}`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    })
});


router.post("/roport", function (req, res) {
    const { years_start, years_end, company_id_fk, insurance_type_fk, agent_id_fk, option_id_fk } = req.body;
    let companyId_fk = '';
    if (company_id_fk) {
        companyId_fk = `AND view_insurance_all.company_id_fk='${company_id_fk}'`;
    }
    let insurance_typeId = '';
    if (insurance_type_fk) {
        insurance_typeId = `AND view_insurance_all.insurance_type_fk='${insurance_type_fk}'`;
    }
  
    let agentId_fk = '';
    if (agent_id_fk) {
        agentId_fk = `AND agent_id_fk='${agent_id_fk}'`;
    }
    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND view_insurance_all.option_id_fk='${option_id_fk}'`;
    }

    let conditions = `${companyId_fk} ${insurance_typeId} ${agentId_fk} ${optionId_fk}`;

    const tables = `view_insurance_all
    LEFT JOIN oac_insurance ON view_insurance_all.insurance_new_id=oac_insurance.incuranec_code `;
    const fields = `view_insurance_all.*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto,
    oac_insurance.contract_number AS contract_numbers,
    oac_insurance.contract_start_date AS contract_start_dates,
    oac_insurance.contract_end_date AS contract_end_dates`;
    const wheres = `view_insurance_all.contract_status='2' AND YEAR( view_insurance_all.contract_start_date) BETWEEN '${years_start}' AND '${years_end}' ${conditions}`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    })
});
module.exports = router;