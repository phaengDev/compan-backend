const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');
router.post("/create", function (req, res) {
    let fileName = '';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './assets/docfile');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            fileName = `file-${Date.now()}${ext}`;
            cb(null, fileName);
        }
    });
    const upload = multer({ storage }).single('file_doct');
    upload(req, res, function (err) {
        const { incuranecCode, custom_id_fk, company_id_fk, agent_id_fk, option_id_fk, currency_id_fk, contract_number, user_fname, user_lname, user_gender, user_dob, user_tel, user_district_fk, user_village } = req.body;
        const { statusIns, car_type_id_fk, car_brand_id_fk, version_name, car_registration, vehicle_number, tank_number } = req.body;
        const {
            percent_taxes,
            precent_incom,
            percent_akorn,
            percent_eps,
            percent_fee_eps,
            status_company,
            status_agent,
            status_oac
        } = req.body;

        const initial_fee = parseFloat(req.body.initial_fee.replace(/,/g, ''));
        const money_taxes = parseFloat(req.body.money_taxes.replace(/,/g, ''));
        const registration_fee = parseFloat(req.body.registration_fee.replace(/,/g, ''));
        const insuranc_included = parseFloat(req.body.insuranc_included.replace(/,/g, ''));
        const pre_tax_profit = parseFloat(req.body.pre_tax_profit.replace(/,/g, ''));
        const incom_money = parseFloat(req.body.incom_money.replace(/,/g, ''));
        const incom_finally = parseFloat(req.body.incom_finally.replace(/,/g, ''));
        const pays_advance_fee = parseFloat(req.body.pays_advance_fee.replace(/,/g, ''));
        const money_percent_fee = parseFloat(req.body.money_percent_fee.replace(/,/g, ''));
        const expences_pays_taxes = parseFloat(req.body.expences_pays_taxes.replace(/,/g, ''));
        const net_income = parseFloat(req.body.net_income.replace(/,/g, ''));

        const contract_start_date = moment(req.body.contract_start_date).format('YYYY-MM-DD');
        const contract_end_date = moment(req.body.contract_end_date).format('YYYY-MM-DD');
        const company_date = moment(req.body.company_date).format('YYYY-MM-DD');
        const agent_date = moment(req.body.agent_date).format('YYYY-MM-DD');
        const oac_date = moment(req.body.oac_date).format('YYYY-MM-DD');
        let userDob = '';
        if (user_dob) {
            userDob = moment(user_dob).format('YYYY-MM-DD');
        }

        const tableins = 'oac_insurance';
        const tableInsurance = 'oac_action_insurance';
        const tableCar = 'oac_cars_insurance';
        if (!incuranecCode) {
            db.autoId(tableins, 'incuranec_code', (err, incuranec_code) => {
                const fieldsct = 'incuranec_code, custom_id_fk,company_id_fk,agent_id_fk,option_id_fk,contract_number,contract_start_date,contract_end_date,contract_status,user_fname,user_lname,user_gender,user_dob,user_tel,user_district_fk,user_village,status_check,status_change,create_date';
                const datact = [incuranec_code, custom_id_fk, company_id_fk, agent_id_fk, option_id_fk, contract_number, contract_start_date, contract_end_date, '1', user_fname, user_lname, user_gender, userDob, user_tel, user_district_fk, user_village, '1', '1', dateTime];
                db.insertData(tableins, fieldsct, datact, (err, results) => {
                    if (err) {
                        console.error('Error inserting data:', err);
                        return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                    }
                    if (statusIns && statusIns === '2') {  //--------- ບັນທຶກຂໍ້ມູນລົດ
                        db.autoId(tableCar, 'cars_code', (err, cars_code) => {
                            const fieldcar = 'cars_code, contract_id_fk,car_type_id_fk,car_brand_id_fk,version_name,car_registration,vehicle_number,tank_number,createcar_date';
                            const datacar = [cars_code, incuranec_code, car_type_id_fk, car_brand_id_fk, version_name, car_registration, vehicle_number, tank_number, dateTime];
                            db.insertData(tableCar, fieldcar, datacar, (err, resultscar) => {
                                if (err) {
                                    return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                                }
                            });
                        });
                    }
                    if (fileName && fileName !== '') {
                        const fieldfile = 'contract_code_fk,file_insurance,create_date';
                        const datafile = [incuranec_code, fileName, dateTime];
                        db.insertData('oac_doc_insurance', fieldfile, datafile, (err, results) => {
                            if (err) {
                                return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                            }
                        });
                    }

                    db.autoId(tableInsurance, 'actionId', (err, actionId) => {
                        const fieldIn = `actionId,
                            contract_code_fk,
                            currency_id_fk,
                            initial_fee,
                            percent_taxes,
                            money_taxes,
                            registration_fee,
                            insuranc_included,
                            precent_incom,
                            pre_tax_profit,
                            percent_akorn,
                            incom_money,
                            incom_finally,
                            percent_eps,
                            pays_advance_fee,
                            percent_fee_eps,
                            money_percent_fee,
                            expences_pays_taxes,
                            net_income,
                            status_company,
                            company_date,
                            status_agent,
                            agent_date,
                            status_oac,
                            oac_date
                            `;
                        const dataIn = [actionId,
                            incuranec_code,
                            currency_id_fk,
                            initial_fee,
                            percent_taxes,
                            money_taxes,
                            registration_fee,
                            insuranc_included,
                            precent_incom,
                            pre_tax_profit,
                            percent_akorn,
                            incom_money,
                            incom_finally,
                            percent_eps,
                            pays_advance_fee,
                            percent_fee_eps,
                            money_percent_fee,
                            expences_pays_taxes,
                            net_income,
                            status_company,
                            company_date,
                            status_agent,
                            agent_date,
                            status_oac,
                            oac_date];
                        db.insertData(tableInsurance, fieldIn, dataIn, (err, resultsIn) => {
                            if (err) {
                                // console.error('Error inserting data:', err);
                                return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                            }
                        });
                    });

                    console.log('Data updated successfully:', results);
                    res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
                });
            });
        } else {

            const fields = 'company_id_fk,agent_id_fk,option_id_fk,contract_number,contract_start_date,contract_end_date,contract_status,user_fname,user_lname,user_gender,user_dob,user_tel,user_district_fk,user_village';
            const newData = [company_id_fk, agent_id_fk, option_id_fk, contract_number, contract_start_date, contract_end_date, '1', user_fname, user_lname, user_gender, userDob, user_tel, user_district_fk, user_village, incuranecCode];
            const condition = 'incuranec_code=?';
            db.updateData(tableins, fields, newData, condition, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                }
                if (statusIns && statusIns === '2') {  //--------- ບັນທຶກຂໍ້ມູນລົດ
                    const fieldcar = 'car_type_id_fk,car_brand_id_fk,version_name,car_registration,vehicle_number,tank_number';
                    const datacar = [car_type_id_fk, car_brand_id_fk, version_name, car_registration, vehicle_number, tank_number, incuranecCode];
                    const conditionCar = 'contract_id_fk=?';
                    db.updateData(tableCar, fieldcar, datacar, conditionCar, (err, resultscar) => {
                        if (err) {
                            return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                        }
                    });
                }
                if (fileName && fileName !== '') {
                    const fieldfile = 'file_insurance';
                    const datafile = [fileName, incuranecCode];
                    const conditionFile = 'contract_code_fk=?';
                    db.updateData('oac_doc_insurance', fieldfile, datafile, conditionFile, (err, results) => {
                        if (err) {
                            return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                        }
                    });
                }

                const fieldIn = `currency_id_fk,
                        initial_fee,
                        percent_taxes,
                        money_taxes,
                        registration_fee,
                        insuranc_included,
                        precent_incom,
                        pre_tax_profit,
                        percent_akorn,
                        incom_money,
                        incom_finally,
                        percent_eps,
                        pays_advance_fee,
                        percent_fee_eps,
                        money_percent_fee,
                        expences_pays_taxes,
                        net_income,
                        status_company,
                        company_date,
                        status_agent,
                        agent_date,
                        status_oac,
                        oac_date
                        `;
                const dataIn = [currency_id_fk,
                    initial_fee,
                    percent_taxes,
                    money_taxes,
                    registration_fee,
                    insuranc_included,
                    precent_incom,
                    pre_tax_profit,
                    percent_akorn,
                    incom_money,
                    incom_finally,
                    percent_eps,
                    pays_advance_fee,
                    percent_fee_eps,
                    money_percent_fee,
                    expences_pays_taxes,
                    net_income,
                    status_company,
                    company_date,
                    status_agent,
                    agent_date,
                    status_oac,
                    oac_date, incuranecCode];
                const conditionIn = 'contract_code_fk=?';
                db.updateData(tableInsurance, fieldIn, dataIn, conditionIn, (err, resultsIn) => {
                    if (err) {
                        return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                    }
                });
                console.log('Data updated successfully:', results);
                res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
            });

        }
    });
});


router.post("/renew", function (req, res) {
    let fileName = '';
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './assets/docfile');
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            fileName = `file-${Date.now()}${ext}`;
            cb(null, fileName);
        }
    });
    const upload = multer({ storage }).single('file_doct');
    upload(req, res, function (err) {
        const { incuranecCode, custom_id_fk, company_id_fk, agent_id_fk, option_id_fk, currency_id_fk, contract_number, user_fname, user_lname, user_gender, user_dob, user_tel, user_district_fk, user_village } = req.body;
        const { statusIns, car_type_id_fk, car_brand_id_fk, version_name, car_registration, vehicle_number, tank_number } = req.body;
        const {
            percent_taxes,
            precent_incom,
            percent_akorn,
            percent_eps,
            percent_fee_eps,
            status_company,
            status_agent,
            status_oac
        } = req.body;

        const initial_fee = parseFloat(req.body.initial_fee.replace(/,/g, ''));
        const money_taxes = parseFloat(req.body.money_taxes.replace(/,/g, ''));
        const registration_fee = req.body.registration_fee;
        const insuranc_included = parseFloat(req.body.insuranc_included.replace(/,/g, ''));
        const pre_tax_profit = parseFloat(req.body.pre_tax_profit.replace(/,/g, ''));
        const incom_money = parseFloat(req.body.incom_money.replace(/,/g, ''));
        const incom_finally = parseFloat(req.body.incom_finally.replace(/,/g, ''));
        const pays_advance_fee = parseFloat(req.body.pays_advance_fee.replace(/,/g, ''));
        const money_percent_fee = parseFloat(req.body.money_percent_fee.replace(/,/g, ''));
        const expences_pays_taxes = parseFloat(req.body.expences_pays_taxes.replace(/,/g, ''));
        const net_income = parseFloat(req.body.net_income.replace(/,/g, ''));

        const contract_start_date = moment(req.body.contract_start_date).format('YYYY-MM-DD');
        const contract_end_date = moment(req.body.contract_end_date).format('YYYY-MM-DD');
        const company_date = moment(req.body.company_date).format('YYYY-MM-DD');
        const agent_date = moment(req.body.agent_date).format('YYYY-MM-DD');
        const oac_date = moment(req.body.oac_date).format('YYYY-MM-DD');
        let userDob = '';
        if (user_dob) {
            userDob = moment(user_dob).format('YYYY-MM-DD');
        }

        const tableins = 'oac_insurance';
        const tableInsurance = 'oac_action_insurance';
        const tableCar = 'oac_cars_insurance';
        db.autoId(tableins, 'incuranec_code', (err, incuranec_code) => { //========== ລົງທະບຽນບັນທຶກຕໍ່ສັນຍາໃໝ່
            const fieldsct = 'incuranec_code, custom_id_fk,company_id_fk,agent_id_fk,option_id_fk,contract_number,contract_start_date,contract_end_date,contract_status,user_fname,user_lname,user_gender,user_dob,user_tel,user_district_fk,user_village,status_check,status_change,create_date';
            const datact = [incuranec_code, custom_id_fk, company_id_fk, agent_id_fk, option_id_fk, contract_number, contract_start_date, contract_end_date, '1', user_fname, user_lname, user_gender, userDob, user_tel, user_district_fk, user_village, '1', '1', dateTime];
            db.insertData(tableins, fieldsct, datact, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                }
                if (statusIns && statusIns === '2') {  //--------- ບັນທຶກຂໍ້ມູນລົດ
                    db.autoId(tableCar, 'cars_code', (err, cars_code) => {
                        const fieldcar = 'cars_code, contract_id_fk,car_type_id_fk,car_brand_id_fk,version_name,car_registration,vehicle_number,tank_number,createcar_date';
                        const datacar = [cars_code, incuranec_code, car_type_id_fk, car_brand_id_fk, version_name, car_registration, vehicle_number, tank_number, dateTime];
                        db.insertData(tableCar, fieldcar, datacar, (err, resultscar) => {
                            if (err) {
                                return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                            }
                        });
                    });
                }
                if (fileName && fileName !== '') {
                    const fieldfile = 'contract_code_fk,file_insurance,create_date';
                    const datafile = [incuranec_code, fileName, dateTime];
                    db.insertData('oac_doc_insurance', fieldfile, datafile, (err, results) => {
                        if (err) {
                            return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                        }
                    });
                }

                db.autoId(tableInsurance, 'actionId', (err, actionId) => {
                    const fieldIn = `actionId,
                            contract_code_fk,
                            currency_id_fk,
                            initial_fee,
                            percent_taxes,
                            money_taxes,
                            registration_fee,
                            insuranc_included,
                            precent_incom,
                            pre_tax_profit,
                            percent_akorn,
                            incom_money,
                            incom_finally,
                            percent_eps,
                            pays_advance_fee,
                            percent_fee_eps,
                            money_percent_fee,
                            expences_pays_taxes,
                            net_income,
                            status_company,
                            company_date,
                            status_agent,
                            agent_date,
                            status_oac,
                            oac_date `;
                    const dataIn = [actionId,
                        incuranec_code,
                        currency_id_fk,
                        initial_fee,
                        percent_taxes,
                        money_taxes,
                        registration_fee,
                        insuranc_included,
                        precent_incom,
                        pre_tax_profit,
                        percent_akorn,
                        incom_money,
                        incom_finally,
                        percent_eps,
                        pays_advance_fee,
                        percent_fee_eps,
                        money_percent_fee,
                        expences_pays_taxes,
                        net_income,
                        status_company,
                        company_date,
                        status_agent,
                        agent_date,
                        status_oac,
                        oac_date];
                    db.insertData(tableInsurance, fieldIn, dataIn, (err, resultsIn) => {
                        if (err) {
                            // console.error('Error inserting data:', err);
                            return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                        }
                    });
                });

                //============= ອັບເດດສັນຍາເກົ່າ
                const fieldeEd = 'insurance_new_id,contract_status';
                const dataEd = [incuranec_code, '2', incuranecCode];
                const conditionEd = 'incuranec_code=?';
                db.updateData(tableins, fieldeEd, dataEd, conditionEd, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                    }
                });

                console.log('Data updated successfully:', results);
                res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
            });
        });
    });
})


//===============
router.get("/:id", function (req, res) {
    const incuranec_code = req.params.id;
    const tables = `view_insurance_all`;
    const where = `incuranec_code=${incuranec_code}`;
    db.fetchSingleAll(tables, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.post("/search", function (req, res) {
    const { contract_number } = req.body;
    const tables = `oac_insurance
    LEFT JOIN oac_agent_sale ON oac_insurance.agent_id_fk=oac_agent_sale.agent_Id
    LEFT JOIN oac_insurance_options ON oac_insurance.option_id_fk=oac_insurance_options.options_Id
    LEFT JOIN oac_type_insurance ON oac_insurance_options.insurance_type_fk=oac_type_insurance.type_insid
    LEFT JOIN oac_company ON oac_insurance.company_id_fk=oac_company.company_Id `;
    const where = `contract_status='1' AND contract_number LIKE '%${contract_number}%'`;
    const fileds = `oac_insurance.incuranec_code,
    oac_insurance.contract_number,
    oac_insurance.contract_start_date,
    oac_insurance.contract_end_date,
    oac_insurance.user_fname,
    oac_insurance.user_lname,
    oac_insurance.user_tel,
    oac_type_insurance.type_in_name,
    oac_insurance_options.options_name,
    oac_agent_sale.agent_name,
    oac_company.com_name_lao,
    oac_company.com_name_eng`;
    db.selectWhere(tables, fileds, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
})


router.post('/movedata', (req, res) => {
    const { contract_end, contract_start } = req.body;
    const fields = `custom_id_fk`;

    if (!Array.isArray(contract_start)) {
        return res.status(400).json({ message: 'ຂໍ້ມູນ ສັນຍາທີ່ຕ້ອງການຍ້າຍ ບໍ່ຖືກຕ້ອງ' });
    }

    const updatePromises = contract_start.map(item => {
        return new Promise((resolve, reject) => {
            const newData = [contract_end, item.incuranec_code];
            const condition = 'incuranec_code=?';
            db.updateData('oac_insurance', fields, newData, condition, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    });
    Promise.all(updatePromises)
        .then(results => {
            res.status(200).json({ message: 'ການຍ້າຍຂໍ້ມູນ ໄດ້ສຳເລັດ', data: results });
        })
        .catch(err => {
            console.error('Error inserting data:', err);
            res.status(500).json({ message: 'ການແຊກຂໍ້ມູນລົ້ມເຫລວ' });
        });
});

router.get("/viewBuy/:id", function (req, res) {
    const customId = req.params.id;
    const tables = `view_insurance_all`;
    const fields = `incuranec_code,contract_number,contract_start_date,contract_end_date,agent_name,com_name_lao,type_in_name,options_name`;
    const wheres = `contract_status='1' AND custom_id_fk='${customId}'`;

    const fieldFile = `*,SUBSTRING_INDEX(file_insurance, '.', -1) AS ext_name`; //======== filed file

    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        const promises = results.map(contract => {
            const whereDoc = `contract_code_fk = '${contract.incuranec_code}'`;
            return new Promise((resolve, reject) => {
                db.selectWhere('oac_doc_insurance', fieldFile, whereDoc, (err, resultsDoc) => {
                    if (err) {
                        return reject(err);
                    }
                    contract.file_doc = resultsDoc;
                    resolve(contract);
                });
            });
        });

        Promise.all(promises).then(updatedResults => {
            res.status(200).json(updatedResults);
        })
            .catch(error => {
                res.status(400).send();
            });

    })
});


router.delete('/:id', function (req, res) {
    const insuranceId = req.params.id;
    const where = `incuranec_code='${insuranceId}'`;
    const whereAc = `contract_code_fk='${insuranceId}'`;
    const whereCar = `contract_id_fk='${insuranceId}'`;
    const whereDoc = `contract_code_fk='${insuranceId}'`;
    const wherePay = `contract_code_fk='${insuranceId}'`;
    try {
        db.deleteData('oac_insurance', where, (err, results) => {
            if (err) {
                console.error('Error insurance data:', err);
                return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
            }
            db.deleteData('oac_action_insurance', whereAc, (err, results) => {
                if (err) {
                    console.error('Error action-insurance data:', err);
                    return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
                }
            });

            db.deleteData('oac_cars_insurance', whereCar, (err, results) => {
                if (err) {
                    console.error('Error cars insurance data:', err);
                    return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
                }
            });
            db.selectAllwhere('oac_doc_insurance', whereDoc, (err, docResults) => {
                if (err) {
                    return res.status(400).send();
                }
                if (docResults && docResults.length > 0) {
                    const doc = docResults[0];
                    const filePath = path.join('assets/docfile/', doc.file_insurance);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting the existing file:', err);
                        }
                    });
                }
            })
            db.deleteData('oac_doc_insurance', whereDoc, (err, results) => {
                if (err) {
                    console.error('Error doc insurance data:', err);
                    return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
                }
            });
            db.deleteData('oac_document_pay', wherePay, (err, results) => {
                if (err) {
                    console.error('Error doc insurance data:', err);
                    return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
                }
            });

            console.log('Data inserted successfully:', results);
            res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ' });
        });
    } catch (err) {
        console.error('Error deleting data:', err);
        res.status(500).json({ error: 'ການລົບຂໍ້ມູນບໍ່ສຳເລັດ' });
    }
});



module.exports = router