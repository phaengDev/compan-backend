const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const currentDatetime = moment();
const dateNow = currentDatetime.format('YYYY-MM-DD');
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');
router.post("/create", function (req, res) {
    const table = 'oac_insurance_retrun';
    db.autoId(table, 'insurance_retrun_id', (err, insurance_retrun_id) => {
        const { insurance_retrunId, company_id_fk, agent_id_fk, custom_buyer_id_fk, option_id_fk, contract_number, currency_id_fk, status_company, company_date, status_agent, agent_date, status_oac, oac_date, remark_text, } = req.body;
        const retrun_balance = parseFloat(req.body.retrun_balance.replace(/,/g, ''));
        if (!insurance_retrunId) {
            const fields = 'insurance_retrun_id, company_id_fk,agent_id_fk,custom_buyer_id_fk,option_id_fk,contract_number,retrun_balance,currency_id_fk,status_company,company_date,status_agent,agent_date,status_oac,oac_date,remark_text,register_date';
            const data = [insurance_retrun_id, company_id_fk, agent_id_fk, custom_buyer_id_fk, option_id_fk, contract_number, retrun_balance, currency_id_fk, status_company, company_date, status_agent, agent_date, status_oac, oac_date, remark_text, dateTime];
            
            db.insertData(table, fields, data, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                }
                console.log('Data inserted successfully:', results);
                res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', id: insurance_retrun_id });
            });
        } else {

            const fields = 'company_id_fk,agent_id_fk,custom_buyer_id_fk,option_id_fk,contract_number,retrun_balance,currency_id_fk,status_company,company_date,status_agent,agent_date,status_oac,oac_date,remark_text';
            const newData = [company_id_fk, agent_id_fk, custom_buyer_id_fk, option_id_fk, contract_number,retrun_balance, currency_id_fk, status_company, company_date, status_agent, agent_date, status_oac, oac_date, remark_text, insurance_retrunId];
            const condition = 'insurance_retrun_id=?';
            db.updateData(table, fields, newData, condition, (err, results) => {
                if (err) {
                    console.error('Error updating data:', err);
                    return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
                }
                console.log('Data updated successfully:', results);
                res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
            });

        }
    });
});


router.post("/retrun", function (req, res) {
    const { insurance_retrun_id, status_retrun,date_retrun, remark_text, } = req.body;
    const dateRetrun=moment(date_retrun).format('YYYY-MM-DD');
    let fieldEdit=``;
    if(status_retrun ===1){
        fieldEdit=`status_company,company_date`;
    } else if(status_retrun ===2){
         fieldEdit=`status_agent,agent_date`;
    } else if(status_retrun ===3){
         fieldEdit=`status_oac,oac_date`;
    }
    const table = 'oac_insurance_retrun';
    const fields = `${fieldEdit}, remark_text`;
    const newData = [2,dateRetrun, remark_text,insurance_retrun_id];
    const condition = 'insurance_retrun_id=?';
    db.updateData(table, fields, newData, condition, (err, results) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
        }
        console.log('Data updated successfully:', results);
        res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
    });
});

router.post("/", function (req, res) {
    const {start_date,end_date, agentId_fk, companyId_fk, insurance_typeId,custom_buyerId_fk } = req.body;
    const startDate=moment(start_date).format('YYYY-MM-DD');
   const endDate=moment(end_date).format('YYYY-MM-DD');
    let agent_id_fk = '';
    if (agentId_fk) {
        agent_id_fk = `AND agent_id_fk='${agentId_fk}'`;
    }
    let company_id_fk = '';
    if (companyId_fk) {
        company_id_fk = `AND company_id_fk='${companyId_fk}'`;
    }
    let insurance_type_fk = '';
    if (insurance_typeId) {
        insurance_type_fk = `AND insurance_type_fk='${insurance_typeId}'`;
    }
    let custom_buyer_id_fk = '';
    if (custom_buyerId_fk) {
        custom_buyer_id_fk = `AND custom_buyer_id_fk='${custom_buyerId_fk}'`;
    }

    const tables = `oac_insurance_retrun
    LEFT JOIN oac_agent_sale ON oac_insurance_retrun.agent_id_fk=oac_agent_sale.agent_Id
    LEFT JOIN oac_insurance_options ON oac_insurance_retrun.option_id_fk=oac_insurance_options.options_Id
	LEFT JOIN oac_type_insurance ON oac_insurance_options.insurance_type_fk=oac_type_insurance.type_insid
    LEFT JOIN oac_company ON oac_insurance_retrun.company_id_fk=oac_company.company_Id
    LEFT JOIN oac_custom_buyer ON oac_insurance_retrun.custom_buyer_id_fk=oac_custom_buyer.custom_uuid
    LEFT JOIN oac_district ON oac_custom_buyer.district_fk=oac_district.district_id
    LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id
	LEFT JOIN oac_currency ON oac_insurance_retrun.currency_id_fk=oac_currency.currency_id`;
    const field = `ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto,
insurance_retrun_id,
company_id_fk,
agent_id_fk,
custom_buyer_id_fk,
option_id_fk,
contract_number,
retrun_balance,
currency_id_fk,
status_company,
company_date,
status_agent,
agent_date,
status_oac,
oac_date,
remark_text,
register_date,
com_logo,
com_name_lao,
com_name_eng,
com_tel,
idcrad_code,
agent_name,
agent_village,
agent_tel,
options_name,
type_in_name,
insurance_type_fk,
custom_profile,
customer_name,
provice_fk,
district_fk,
village_name,
registra_tel,
status_changs,
district_name,
province_name,
currency_name,
genus`;
    const wheres = `DATE(register_date) BETWEEN '${startDate}' AND '${endDate}' ${agent_id_fk} ${company_id_fk} ${insurance_type_fk} ${custom_buyer_id_fk}`;
    db.selectWhere(tables, field, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.post("/report", function (req, res) {
    const {
        status,
        statusRetrun,
        datecheck,
        start_date,
        end_date,
        agentId_fk,
        companyId_fk,
        insurance_typeId,
        custom_buyerId_fk
    } = req.body;

    const startDate = start_date ? moment(start_date).format('YYYY-MM-DD') : null;
    const endDate = end_date ? moment(end_date).format('YYYY-MM-DD') : null;

    let statusUse = '';
    if (statusRetrun) {
        if (status === 1) {
            statusUse = `AND status_company = ${statusRetrun}`;
        } else if (status === 2) {
            statusUse = `AND status_agent = ${statusRetrun}`;
        } else if (status === 3) {
            statusUse = `AND status_oac = ${statusRetrun}`;
        }
    }

    let dateSearch = '';
    if (startDate && endDate) {
        dateSearch = `AND ${datecheck} BETWEEN '${startDate}' AND '${endDate}'`;
    }

    let agent_id_fk = '';
    if (agentId_fk) {
        agent_id_fk = `AND agent_id_fk = '${agentId_fk}'`;
    }

    let company_id_fk = '';
    if (companyId_fk) {
        company_id_fk = `AND company_id_fk = '${companyId_fk}'`;
    }

    let insurance_type_fk = '';
    if (insurance_typeId) {
        insurance_type_fk = `AND insurance_type_fk = '${insurance_typeId}'`;
    }

    let custom_buyer_id_fk = '';
    if (custom_buyerId_fk) {
        custom_buyer_id_fk = `AND custom_buyer_id_fk = '${custom_buyerId_fk}'`;
    }

    const tables = `oac_insurance_retrun
        LEFT JOIN oac_agent_sale ON oac_insurance_retrun.agent_id_fk = oac_agent_sale.agent_Id
        LEFT JOIN oac_insurance_options ON oac_insurance_retrun.option_id_fk = oac_insurance_options.options_Id
        LEFT JOIN oac_type_insurance ON oac_insurance_options.insurance_type_fk = oac_type_insurance.type_insid
        LEFT JOIN oac_company ON oac_insurance_retrun.company_id_fk = oac_company.company_Id
        LEFT JOIN oac_custom_buyer ON oac_insurance_retrun.custom_buyer_id_fk = oac_custom_buyer.custom_uuid
        LEFT JOIN oac_district ON oac_custom_buyer.district_fk = oac_district.district_id
        LEFT JOIN oac_province ON oac_district.provice_fk = oac_province.province_id
        LEFT JOIN oac_currency ON oac_insurance_retrun.currency_id_fk = oac_currency.currency_id`;

    const fields = `ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto,
        insurance_retrun_id,
        company_id_fk,
        agent_id_fk,
        custom_buyer_id_fk,
        option_id_fk,
        contract_number,
        retrun_balance,
        currency_id_fk,
        status_company,
        company_date,
        status_agent,
        agent_date,
        status_oac,
        oac_date,
        remark_text,
        register_date,
        com_logo,
        com_name_lao,
        com_name_eng,
        com_tel,
        idcrad_code,
        agent_name,
        agent_village,
        agent_tel,
        options_name,
        type_in_name,
        insurance_type_fk,
        custom_profile,
        customer_name,
        provice_fk,
        district_fk,
        village_name,
        registra_tel,
        status_changs,
        district_name,
        province_name,
        currency_name,
        genus`;

    let wheres = `agent_status = '1' ${statusUse} ${dateSearch} ${agent_id_fk} ${company_id_fk} ${insurance_type_fk} ${custom_buyer_id_fk}`;

    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(400).send('Error fetching data');
        }
        res.status(200).json(results);
    });
});


router.delete("/:id", async (req, res) => {
    const insurance_retrun_id = req.params.id;
    const table = 'oac_insurance_retrun';
    const where = `insurance_retrun_id=${insurance_retrun_id}`;
    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.get("/edit/:id", async (req, res) => {
    const insurance_retrun_id = req.params.id;
    const table = `oac_insurance_retrun
    LEFT JOIN oac_insurance_options ON oac_insurance_retrun.option_id_fk=oac_insurance_options.options_Id
	LEFT JOIN oac_type_insurance ON oac_insurance_options.insurance_type_fk=oac_type_insurance.type_insid`;
    const fields=`*`;
    const where = `insurance_retrun_id=${insurance_retrun_id}`;
    db.fetchSingle(table,fields, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json(results);
    });
});


module.exports = router;