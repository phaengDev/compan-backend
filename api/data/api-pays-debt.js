const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');

router.post("/create", async function (req, res) {
    let fileName = '';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './assets/docPay');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            fileName = `${Date.now()}${ext}`;
            cb(null, fileName);
        }
    });
    const table = 'oac_document_pay';
    const upload = multer({ storage }).single('docom_file');
    upload(req, res, function (err) {
        const { contract_code_fk, contract_no, status_pay, status_doc, debt_remark, doccm_date } = req.body;
        const doccmDate = moment(doccm_date).format('YYYY-MM-DD HH:mm:ss');
        const fieldsct = 'contract_code_fk,contract_no,docom_file,status_pay,status_doc,debt_remark,doccm_date';
        const datact = [contract_code_fk, contract_no, fileName, status_pay, status_doc, debt_remark, doccmDate];
        db.insertData(table, fieldsct, datact, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
            }
            let field = '';
            let newData = ['2', doccmDate, doccmDate, doccmDate, contract_code_fk];
            if (status_doc === '1') {
                field = 'status_company,company_date,agent_date,oac_date';
            } else if (status_doc === '2') {
                field = 'status_agent,agent_date';
            } else {
                field = 'status_oac,oac_date';
            }
            const condition = 'contract_code_fk=?';
            db.updateData('oac_action_insurance', field, newData, condition, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
                }
                res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
            });
        })
    })
});


router.post("/edit", async function (req, res) {
    let fileName = '';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './assets/docPay');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            fileName = `${Date.now()}${ext}`;
            cb(null, fileName);
        }
    });
    const upload = multer({ storage }).single('docom_file');
    upload(req, res, function (err) {
        const { docoment_id, contract_code_fk, contract_no, status_doc, debt_remark, doccm_date, fileNameck } = req.body;
        const doccmDate = moment(doccm_date).format('YYYY-MM-DD HH:mm:ss');
        const datePays = moment(doccm_date).format('YYYY-MM-DD');
        const fieldsct = 'contract_no,docom_file,debt_remark,doccm_date';
        const datact = [contract_no, fileName, debt_remark, doccmDate, docoment_id];
        const conditionFile = 'docoment_id=?';
        db.updateData('oac_document_pay', fieldsct, datact, conditionFile, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
            }
            if (fileNameck) {
                fs.unlink(`./assets/docPay/${fileNameck}`, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return res.status(500).json({ error: 'ການລົບຮູບພາບບໍ່ສຳເລັດ' });
                    }
                });
            }


            let field = '';
            let newData = [datePays, contract_code_fk];
            if (status_doc === 1) {
                field = 'company_date';
            } else if (status_doc === 2) {
                field = 'agent_date';
            } else {
                field = 'oac_date';
            }
            const condition = 'contract_code_fk=?';
            db.updateData('oac_action_insurance', field, newData, condition, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
                }
                res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
            });
        });
    });
});

router.post("/delete", async function (req, res) {
    const { docoment_id, contract_code_fk, contract_start_date, company_date, docom_file, status_doc } = req.body;
    const condition = `docoment_id=${docoment_id}`;
    db.deleteData('oac_document_pay', condition, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ການລົບຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        if (docom_file) {
            fs.unlink(`./assets/docPay/${docom_file}`, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return res.status(500).json({ error: 'ການລົບຮູບພາບບໍ່ສຳເລັດ' });
                }
            });
        }
        
        let field = '';
        let newData = [1, contract_start_date, contract_code_fk];
        if (status_doc === 1) {
            field = 'status_company,company_date';
        } else if (status_doc === 2) {
            newData = [1, company_date, contract_code_fk];
            field = 'status_agent,agent_date';
        } else {
            newData = [1, company_date, contract_code_fk];
            field = 'status_oac,oac_date';
        }

        const condition = 'contract_code_fk=?';
        db.updateData('oac_action_insurance', field, newData, condition, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
            }
            res.status(200).json({ message: 'ການລົບຂຂໍ້ມູນສຳເລັດ', data: results });
        });
    });
});




router.post("/createMT", async function (req, res) {
    const table = 'oac_document_pay';
    const { itemList, status_pay, status_doc, debt_remark, doccm_date } = req.body;
    const doccmDate = moment(doccm_date).format('YYYY-MM-DD HH:mm:ss');
    const fieldsct = 'contract_code_fk, contract_no, docom_file, status_pay, status_doc, debt_remark, doccm_date';

    let field = '';
    if (status_doc === 1) {
        field = 'status_company,company_date,agent_date,oac_date';
    } else if (status_doc === 2) {
        field = 'status_agent,agent_date';
    } else {
        field = 'status_oac,oac_date';
    }

    const updatePromises = itemList.map(item => {
        return new Promise((resolve, reject) => {
            const datact = [item.contract_code_fk, item.contract_no, '', status_pay, status_doc, debt_remark, doccmDate];
            db.insertData(table, fieldsct, datact, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
                const newData = ['2', doccmDate, doccmDate, doccmDate, item.contract_code_fk];
                const condition = 'contract_code_fk=?';
                db.updateData('oac_action_insurance', field, newData, condition, (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            })
        });
    });
    Promise.all(updatePromises)
        .then(results => {
            res.status(200).json({ message: 'ການຕັດໜີ້ໄດ້ສຳເລັດແລ້ວ' });
        })
        .catch(err => {
            console.error('Error inserting data:', err);
            res.status(500).json({ message: 'ການແຊກຂໍ້ມູນລົ້ມເຫລວ' });
        });

});


router.post("/report", async function (req, res) {
    const { status_doc, start_date, end_date, company_id_fk, agent_id_fk, option_id_fk, insurance_type_fk } = req.body;
    const startDate = moment(start_date).format('YYYY-MM-DD');
    const endDate = moment(end_date).format('YYYY-MM-DD');

    let companyId_fk = '';
    if (company_id_fk) {
        companyId_fk = `AND company_id_fk='${company_id_fk}'`;
    }

    let agentId_fk = '';
    if (agent_id_fk) {
        agentId_fk = `AND agent_id_fk='${agent_id_fk}'`;
    }

    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND option_id_fk='${option_id_fk}'`;
    }
    let insurance_typeId = '';
    if (insurance_type_fk) {
        insurance_typeId = `AND insurance_type_fk='${insurance_type_fk}'`;
    }

    let conditions = `${companyId_fk} ${agentId_fk} ${optionId_fk} ${insurance_typeId} `;
    const tables = `oac_document_pay 
     LEFT JOIN view_insurance_all ON oac_document_pay.contract_code_fk=view_insurance_all.incuranec_code`;
    const fields = `ROW_NUMBER() OVER (ORDER BY doccm_date) AS idAuto,
    oac_document_pay.docoment_id,
    oac_document_pay.docom_file,
    oac_document_pay.status_pay,
    oac_document_pay.status_doc,
    oac_document_pay.debt_remark,
    oac_document_pay.doccm_date,
    view_insurance_all.contract_number,
    view_insurance_all.contract_start_date,
    view_insurance_all.contract_end_date,
    view_insurance_all.contract_status,
    view_insurance_all.status_check,
    view_insurance_all.status_change,
    view_insurance_all.create_date,
    view_insurance_all.customer_name,
    view_insurance_all.initial_fee,
    view_insurance_all.percent_taxes,
    view_insurance_all.money_taxes,
    view_insurance_all.registration_fee,
    view_insurance_all.insuranc_included,
    view_insurance_all.precent_incom,
    view_insurance_all.pre_tax_profit,
    view_insurance_all.percent_akorn,
    view_insurance_all.incom_money,
    view_insurance_all.incom_finally,
    view_insurance_all.percent_eps,
    view_insurance_all.pays_advance_fee,
    view_insurance_all.percent_fee_eps,
    view_insurance_all.money_percent_fee,
    view_insurance_all.expences_pays_taxes,
    view_insurance_all.agent_name,
    view_insurance_all.currency_name,
    view_insurance_all.genus,
    view_insurance_all.reate_price,
    type_in_name,
    type_buyer_name,
    options_name,
    com_name_lao,
    com_name_eng`;
    const wheres = `status_doc='${status_doc}' AND DATE(doccm_date) BETWEEN '${startDate}' AND '${endDate}' ${conditions} `;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});


router.get("/contract/:id", function (req, res) {
    const contract_code_fk = req.params.id;
    const tables = `oac_document_pay
	LEFT JOIN oac_insurance ON oac_document_pay.contract_code_fk = oac_insurance.incuranec_code
	LEFT JOIN oac_action_insurance ON oac_insurance.incuranec_code = oac_action_insurance.contract_code_fk
	LEFT JOIN oac_currency ON oac_action_insurance.currency_id_fk = oac_currency.currency_id`;
    const field = `oac_document_pay.docoment_id, 
	oac_document_pay.contract_code_fk, 
	oac_document_pay.contract_no, 
	oac_document_pay.docom_file, 
	oac_document_pay.status_pay, 
	oac_document_pay.status_doc, 
	oac_document_pay.debt_remark, 
	oac_document_pay.doccm_date, 
	oac_insurance.contract_number, 
	oac_insurance.contract_start_date, 
	oac_insurance.contract_end_date, 
	oac_action_insurance.initial_fee, 
	oac_action_insurance.percent_taxes, 
	oac_action_insurance.money_taxes, 
	oac_action_insurance.registration_fee, 
	oac_action_insurance.insuranc_included, 
	oac_action_insurance.precent_incom, 
	oac_action_insurance.pre_tax_profit, 
	oac_action_insurance.percent_akorn, 
	oac_action_insurance.incom_money, 
	oac_action_insurance.incom_finally, 
	oac_action_insurance.percent_eps, 
	oac_action_insurance.pays_advance_fee, 
	oac_action_insurance.percent_fee_eps, 
	oac_action_insurance.money_percent_fee, 
	oac_action_insurance.expences_pays_taxes, 
	oac_action_insurance.net_income, 
	oac_action_insurance.status_company, 
	oac_action_insurance.company_date, 
	oac_action_insurance.status_agent, 
	oac_action_insurance.agent_date, 
	oac_action_insurance.status_oac, 
	oac_action_insurance.oac_date, 
	oac_currency.currency_name, 
	oac_currency.genus`;
    const wheres = `oac_document_pay.contract_code_fk='${contract_code_fk}' ORDER BY status_doc ASC`;
    db.selectWhere(tables, field, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

module.exports = router;