const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const currentDatetime = moment();
const dateNow = currentDatetime.format('YYYY-MM-DD');
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');
router.post("/create", function (req, res) {
    let fileName = '';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './assets/docfile');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            fileName = `retrun-${Date.now()}${ext}`;
            cb(null, fileName);
        }
    });
    const upload = multer({ storage }).single('file_doc');
    upload(req, res, function (err) {
        const table = 'oac_insurance_retrun';
        db.autoId(table, 'insurance_retrun_id', (err, insurance_retrun_id) => {

            const { insurance_retrunId, company_id_fk, agent_id_fk, custom_buyer_id_fk, option_id_fk, contract_number, currency_id_fk, status_company, company_date, percent_agent, status_agent, agent_date, percent_oac, status_oac, oac_date, remark_text } = req.body;
            const retrun_balance = parseFloat(req.body.retrun_balance.replace(/,/g, ''));
            const companyDate = moment(company_date).format('YYYY-MM-DD');
            const agentDate = moment(agent_date).format('YYYY-MM-DD');
            const oacDate = moment(oac_date).format('YYYY-MM-DD');
            if (!insurance_retrunId) {
                const fields = 'insurance_retrun_id, company_id_fk,agent_id_fk,custom_buyer_id_fk,option_id_fk,contract_number,retrun_balance,currency_id_fk,status_company,company_date,percent_agent,status_agent,agent_date,percent_oac,status_oac,oac_date,remark_text,register_date,file_doc';
                const data = [insurance_retrun_id, company_id_fk, agent_id_fk, custom_buyer_id_fk, option_id_fk, contract_number, retrun_balance, currency_id_fk, status_company, companyDate, percent_agent, status_agent, agentDate, percent_oac, status_oac, oacDate, remark_text, dateTime, fileName];

                db.insertData(table, fields, data, (err, results) => {
                    if (err) {
                        console.error('Error inserting data:', err);
                        return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                    }
                    console.log('Data inserted successfully:', results);
                    res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', id: insurance_retrun_id });
                });
            } else {

                const where = `insurance_retrun_id='${insurance_retrunId}'`;
                db.selectWhere(table, '*', where, (err, results) => {
                    if (results[0].file_doc && results[0].file_doc !== '' && fileName !== '') {
                        const filePath = path.join('assets/docfile/', results[0].file_doc);
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error('Error deleting the existing file:', err);
                            }
                        });
                    }
                    let filedoc = results[0].file_doc;
                    if (fileName !== '') {
                        filedoc = fileName;
                    }
                    const fields = 'company_id_fk,agent_id_fk,custom_buyer_id_fk,option_id_fk,contract_number,retrun_balance,currency_id_fk,status_company,company_date,percent_agent,status_agent,agent_date,percent_oac,status_oac,oac_date,remark_text,file_doc';
                    const newData = [company_id_fk, agent_id_fk, custom_buyer_id_fk, option_id_fk, contract_number, retrun_balance, currency_id_fk, status_company, companyDate, percent_agent, status_agent, agentDate, percent_oac, status_oac, oacDate, remark_text, filedoc, insurance_retrunId];
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

            }
        });
    });
});


router.post('/retrun', (req, res) => {
    let fileNamePay = '';
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, './assets/docPay'),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            fileNamePay = `rfpay-${Date.now()}${ext}`;
            cb(null, fileNamePay);
        },
    });

    const upload = multer({ storage }).single('file_pay');
    upload(req, res, (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ message: 'File upload failed.' });
        }

        const { insurance_retrun_id, status_retrun, retrun_date, remark_text, status_pay } = req.body;

        if (!insurance_retrun_id || !status_retrun || !retrun_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const dateRetrun = moment(retrun_date).format('YYYY-MM-DD');
        let fieldEdit = '';
        if (status_retrun === '1') {
            fieldEdit = 'status_company, company_date';
        } else if (status_retrun === '2') {
            fieldEdit = 'status_agent, agent_date';
        } else if (status_retrun === '3') {
            fieldEdit = 'status_oac, oac_date';
        }

        const fields = `${fieldEdit}, remark_text`;
        const newData = [2, dateRetrun, remark_text, insurance_retrun_id];
        const condition = 'insurance_retrun_id = ?';
       // ===================== filse list =======
       const fieldsFile = 'contract_id_fk,status_pay,file_doct';
       const dataFile = [insurance_retrun_id, status_pay, fileNamePay];
       //================================\\===========
        db.updateData('oac_insurance_retrun', fields, newData, condition, (err, results) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'Failed to update data.' });
        }
            
            db.insertData('tbl_filepay_refund', fieldsFile, dataFile, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                }
                // console.log('Data updated successfully:', results);
                res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ'});
            });
        });
    });
});




    router.post("/", function (req, res) {
        const { start_date, end_date, agentId_fk, companyId_fk, insurance_typeId, custom_buyerId_fk,option_id_fk } = req.body;
        const startDate = moment(start_date).format('YYYY-MM-DD');
        const endDate = moment(end_date).format('YYYY-MM-DD');
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

        let optionId_fk = '';
        if (option_id_fk) {
            optionId_fk = `AND oac_insurance_retrun.option_id_fk='${option_id_fk}'`;
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
                    DATEDIFF(CURDATE(), oac_insurance_retrun.company_date) AS day_cpn,
                    percent_agent,
                    (retrun_balance * percent_agent / 100) AS balance_agent,
                    status_agent,
                    agent_date,
                    DATEDIFF(CURDATE(), oac_insurance_retrun.agent_date) AS day_agent,
                    percent_oac,
                    (retrun_balance * percent_oac / 100) AS balance_oac,
                    status_oac,
                    oac_date,
                    DATEDIFF(CURDATE(), oac_insurance_retrun.oac_date) AS day_oac,
                    remark_text,
                    register_date,
                    oac_insurance_retrun.file_doc,
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
        const wheres = `DATE(register_date) BETWEEN '${startDate}' AND '${endDate}' ${agent_id_fk} ${company_id_fk} ${insurance_type_fk} ${custom_buyer_id_fk} ${optionId_fk}`;
        db.selectWhere(tables, field, wheres, (err, results) => {
            if (err) {
                return res.status(400).send();
            }
            const promises = results.map(contract => {
                const whereDoc = `contract_id_fk = '${contract.insurance_retrun_id}'`;

                return new Promise((resolve, reject) => {
                    db.selectWhere('tbl_filepay_refund','*', whereDoc, (err, resultsDoc) => {
                        if (err) {
                            return reject(err);
                        }
                        contract.file_pay = resultsDoc.length ? resultsDoc : [];
                        resolve(contract);
                    });
                });
            });
                Promise.all(promises)
                    .then(updatedResults => {
                        res.status(200).json(updatedResults);
                    })
                    .catch(error => {
                        res.status(400).send();
                    });
            // res.status(200).json(results);
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
            custom_buyerId_fk,
            option_id_fk
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

        let optionId_fk = '';
        if (option_id_fk) {
            optionId_fk = `AND oac_insurance_retrun.option_id_fk='${option_id_fk}'`;
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
         DATEDIFF(CURDATE(), oac_insurance_retrun.company_date) AS day_cpn,
        percent_agent,
        (retrun_balance * percent_agent / 100) AS balance_agent,
        status_agent,
        agent_date,
          DATEDIFF(CURDATE(), oac_insurance_retrun.agent_date) AS day_agent,
        percent_oac,
        (retrun_balance * percent_oac / 100) AS balance_oac,
        status_oac,
        oac_date,
         DATEDIFF(CURDATE(), oac_insurance_retrun.oac_date) AS day_oac,
        remark_text,
        register_date,
        oac_insurance_retrun.file_doc,
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
        let wheres = `agent_status = '1' ${statusUse} ${dateSearch} ${agent_id_fk} ${company_id_fk} ${insurance_type_fk} ${custom_buyer_id_fk} ${optionId_fk}`;
        db.selectWhere(tables, fields, wheres, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(400).send('Error fetching data');
            }
            const promises = results.map(contract => {
                const whereDoc = `contract_id_fk = '${contract.insurance_retrun_id}'`;
                return new Promise((resolve, reject) => {
                    db.selectWhere('tbl_filepay_refund', '*', whereDoc, (err, resultsDoc) => {
                        if (err) {
                            return reject(err);
                        }
                        contract.doc_pays = resultsDoc;
                        resolve(contract);
                    });
                });
            });
            Promise.all(promises)
            .then(updatedResults => {
                res.status(200).json(updatedResults);
            })
            .catch(error => {
                res.status(400).send();
            });
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
        const fields = `*`;
        const where = `insurance_retrun_id=${insurance_retrun_id}`;
        db.fetchSingle(table, fields, where, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
            }
            console.log('Data inserted successfully:', results);
            res.status(200).json(results);
        });
    });


    // =============================


    router.post("/cn", function (req, res) {
        const { start_date, end_date, companyId_fk, insurance_typeId, option_id_fk, status_refund } = req.body;
        const startDate = moment(start_date).format('YYYY-MM-DD');
        const endDate = moment(end_date).format('YYYY-MM-DD');

        let optionId_fk = '';
        if (option_id_fk) {
            optionId_fk = `AND option_id_fk='${option_id_fk}'`;
        }
        let insurance_type_fk = '';
        if (insurance_typeId) {
            insurance_type_fk = `AND insurance_type_fk='${insurance_typeId}'`;
        }
        const statusRefund = ``;
        if (status_refund) {
            if (status_refund === 'cm-1') {
                statusRefund = `AND status_company = 1`;
            } else if (status_refund === 'cm-2') {
                statusRefund = `AND status_company = 2`;
            } else if (status_refund === 'ac-1') {
                statusRefund = `AND status_oac = 1`;
            } else if (status_refund === 'ac-2') {
                statusRefund = `AND status_oac = 2`;
            }

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
    DATEDIFF(CURDATE(), oac_insurance_retrun.company_date) AS day_cpn,
    percent_agent,
    (retrun_balance * percent_agent / 100) AS balance_agent,
    status_agent,
    agent_date,
    DATEDIFF(CURDATE(), oac_insurance_retrun.agent_date) AS day_agent,
    percent_oac,
    (retrun_balance * percent_oac / 100) AS balance_oac,
    status_oac,
    oac_date,
    DATEDIFF(CURDATE(), oac_insurance_retrun.oac_date) AS day_oac,
    remark_text,
    register_date,
    oac_insurance_retrun.file_doc,
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
        const wheres = `DATE(register_date) BETWEEN '${startDate}' AND '${endDate}' AND company_id_fk='${companyId_fk}'  ${insurance_type_fk} ${optionId_fk} ${statusRefund} ORDER BY register_date ASC`;
        db.selectWhere(tables, field, wheres, (err, results) => {
            if (err) {
                return res.status(400).send();
            }
            res.status(200).json(results);
        });
    });

    // =================

    router.post("/report-pay", function (req, res) {
        const {
            status,
            statusRetrun,
            datecheck,
            start_date,
            end_date,
            agentId_fk,
            companyId_fk,
            insurance_typeId,
            option_id_fk
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

        const dateSearch = `${datecheck} BETWEEN '${startDate}' AND '${endDate}'`;


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

        let optionId_fk = '';
        if (option_id_fk) {
            optionId_fk = `AND option_id_fk = '${option_id_fk}'`;
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
        percent_agent,
        (retrun_balance * percent_agent / 100) AS balance_agent,
        status_agent,
        agent_date,
        percent_oac,
        (retrun_balance * percent_oac / 100) AS balance_oac,
        status_oac,
        oac_date,
        remark_text,
        register_date,
        oac_insurance_retrun.file_doc,
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
        genus,
        (SELECT file_doct FROM tbl_filepay_refund WHERE contract_id_fk=oac_insurance_retrun.insurance_retrun_id AND status_pay=${status} LIMIT 1) AS file_pay`;

        const wheres = `${dateSearch} ${statusUse}  ${agent_id_fk} ${company_id_fk} ${insurance_type_fk} ${optionId_fk} ORDER BY ${datecheck} ASC`;
        db.selectWhere(tables, fields, wheres, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(400).send('Error fetching data');
            }
            res.status(200).json(results);
        });
    });


    module.exports = router;