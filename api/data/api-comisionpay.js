const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const currentDatetime = moment();
const dateNow = currentDatetime.format('YYYY-MM-DD');
router.post("/create", async function (req, res) {
    const { company_id_fk,agent_id_fk, typeList } = req.body;
    const tables = 'oac_commision_pay';
    const fields = `company_id_fk,agent_id_fk,insurnce_type_fk,percent`;
    const where = `company_id_fk=${company_id_fk} AND agent_id_fk=${agent_id_fk}`;
    try {
        const existingRecords = await new Promise((resolve, reject) => {
            db.selectAllwhere(tables, where, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const insertPromises = typeList.map(item => {
            if (!existingRecords.some(record => record.insurnce_type_fk === item.insurnce_type_fk)) {
                return new Promise((resolve, reject) => {
                    const datacms = [company_id_fk,agent_id_fk, item.insurnce_type_fk, item.percent];
                    db.insertData(tables, fields, datacms, (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });
            } else {
                return Promise.resolve();
            }
        });
        await Promise.all(insertPromises.filter(promise => promise));
        res.status(200).json({ message: 'ການຕັດໜີ້ໄດ້ສຳເລັດແລ້ວ' });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ message: 'ການແຊກຂໍ້ມູນລົ້ມເຫລວ' });
    }
});

router.delete("/:id", async (req, res) => {
    const comisId = req.params.id;
    const table = 'oac_commision_pay';
    const where = `comis_agent_id=${comisId}`;
    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.put("/edit", async (req, res) => {
    const {comis_agent_id, percent } = req.body;
    const fieldes = 'percent';
    const datas = [percent, comis_agent_id];
    const condition = 'comis_agent_id=?';
    const tables='oac_commision_pay';
    db.updateData(tables, fieldes, datas, condition, (err, results) => {
        if (err) {
            return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
        }

    console.log('Data updated successfully:', results);
    res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
    });
});

router.post("/single", function (req, res) {
    const { companyId_fk, insurnce_typeId,agentId_fk } = req.body;
    const wheres = `company_id_fk=${companyId_fk} AND insurnce_type_fk=${insurnce_typeId} AND agent_id_fk=${agentId_fk}`;
    db.fetchSingle('oac_commision_pay','*', wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});




router.post("/fetch", function (req, res) {
    const { companyId_fk, insurnce_typeId,agentId_fk } = req.body;
    let insurnce_type_fk = '';
    if (insurnce_typeId) {
        insurnce_type_fk = `AND insurnce_type_fk='${insurnce_typeId}'`;
    }
    let company_id_fk = '';
    if (companyId_fk) {
        company_id_fk = `AND company_id_fk='${companyId_fk}'`;
    }
    let agent_id_fk = '';
    if (agentId_fk) {
        agent_id_fk = `AND agent_id_fk='${agentId_fk}'`;
    }

    const tables = `oac_commision_pay
    LEFT JOIN oac_company ON oac_commision_pay.company_id_fk=oac_company.company_Id
    LEFT JOIN oac_type_insurance ON oac_commision_pay.insurnce_type_fk=oac_type_insurance.type_insid
    LEFT JOIN oac_agent_sale ON oac_commision_pay.agent_id_fk=oac_agent_sale.agent_Id`;
    const field = `oac_commision_pay.comis_agent_id, 
	oac_commision_pay.company_id_fk, 
	oac_commision_pay.insurnce_type_fk, 
    oac_commision_pay.agent_id_fk,
	oac_commision_pay.percent, 
	oac_company.com_name_lao, 
	oac_type_insurance.type_in_name,
    oac_agent_sale.agent_name`;
    const wheres = `com_status='1' ${company_id_fk} ${insurnce_type_fk} ${agent_id_fk}`;
    db.selectWhere(tables, field, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

module.exports = router