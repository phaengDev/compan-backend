const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const currentDatetime = moment();
const dateNow = currentDatetime.format('YYYY-MM-DD');router.post("/create", async function (req, res) {
    const { company_id_fk, typeList } = req.body;
    const tables = 'oac_commision_get';
    const fields = `company_id_fk,insurnce_type_fk,percent`;
    const where = `company_id_fk=${company_id_fk}`;
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
                    const datacms = [company_id_fk, item.insurnce_type_fk, item.percent];
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
    const table = 'oac_commision_get';
    const where = `comis_oac_id=${comisId}`;
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
    const {comis_oac_id, percent } = req.body;
    const fieldes = 'percent';
    const datas = [percent, comis_oac_id];
    const condition = 'comis_oac_id=?';
    const tables='oac_commision_get';
    db.updateData(tables, fieldes, datas, condition, (err, results) => {
        if (err) {
            return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
        }

    console.log('Data updated successfully:', results);
    res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
    });
});
router.post("/single", function (req, res) {
    const { companyId, typeins, agentId } = req.body;
    const wheres = `company_id_fk=${companyId} AND insurnce_type_fk=${typeins}`;

    db.fetchSingle('oac_commision_get', '*', wheres, (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error fetching commission data' });
        }

        let psget = 0;
        if (results && results.percent) {
            psget = results.percent;
        }

        const whereAg = `company_id_fk=${companyId} AND insurnce_type_fk=${typeins} AND agent_id_fk=${agentId}`;
        db.fetchSingle('oac_commision_pay', '*', whereAg, (err, resultsAg) => {
            if (err) {
                return res.status(400).json({ message: 'Error fetching agent commission data' });
            }

            let pspay = 0;
            if (resultsAg && resultsAg.percent) {
                pspay = resultsAg.percent;
            }

            res.status(200).json({
                percentGet: psget,
                percentPay: pspay
            });
        });
    });
});




router.post("/fetch", function (req, res) {
    const { companyId_fk, insurnce_typeId } = req.body;
    let insurnce_type_fk = '';
    if (insurnce_typeId) {
        insurnce_type_fk = `AND insurnce_type_fk='${insurnce_typeId}'`;
    }
    let company_id_fk = '';
    if (companyId_fk) {
        company_id_fk = `AND company_id_fk='${companyId_fk}'`;
    }

    const tables = `oac_commision_get
    LEFT JOIN oac_company ON oac_commision_get.company_id_fk=oac_company.company_Id
    LEFT JOIN oac_type_insurance ON oac_commision_get.insurnce_type_fk=oac_type_insurance.type_insid`;
    const field = `oac_commision_get.comis_oac_id, 
	oac_commision_get.company_id_fk, 
	oac_commision_get.insurnce_type_fk, 
	oac_commision_get.percent, 
	oac_company.com_name_lao, 
	oac_type_insurance.type_in_name`;
    const wheres = `com_status='1' ${company_id_fk} ${insurnce_type_fk} `;
    db.selectWhere(tables, field, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

module.exports = router