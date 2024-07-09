const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const jwt = require('../../jwt');

router.post("/create", function (req, res) {

    let logoName = '';
    const table = 'oac_company';
    db.autoId(table, 'company_Id', (err, company_Id) => {
        const storage = multer.diskStorage({
            destination: function (req, com_logo, cb) {
                cb(null, './assets/logo');
            },
            filename: function (req, com_logo, cb) {
                const ext = path.extname(com_logo.originalname);
                logoName = `logo-${company_Id}${ext}`;
                cb(null, logoName);
            }
        });

        const upload = multer({ storage }).single('com_logo');
        upload(req, res, function (err) {
            const { companyId, com_name_lao, com_name_eng, com_tel, com_address, com_status } = req.body;

            if (!companyId) {
                const fields = 'company_Id,com_logo,com_name_lao,com_name_eng,com_tel,com_address,com_status';
                const data = [company_Id, logoName, com_name_lao, com_name_eng, com_tel, com_address, com_status];
                db.insertData(table, fields, data, (err, results) => {
                    if (err) {
                        console.error('Error inserting data:', err);
                        return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
                    }
                    console.log('Data inserted successfully:', results);
                    res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
                });
            } else {

                const where = `company_Id='${companyId}'`;
                db.selectWhere(table, '*', where, (err, results) => {
                    if (results[0].com_logo && results[0].com_logo !== '' && logoName !== '') {
                        const filePath = path.join('assets/logo/', results[0].com_logo);
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error('Error deleting the existing file:', err);
                            }
                        });
                    }
                    let fileName = results[0].com_logo;
                    if (logoName !== '') {
                        fileName = logoName;
                    }

                    const field = 'com_logo,com_name_lao,com_name_eng,com_tel,com_address';
                    const newData = [fileName, com_name_lao, com_name_eng, com_tel, com_address, companyId];
                    const condition = 'company_Id=?';
                    db.updateData(table, field, newData, condition, (err, results) => {
                        if (err) {
                            console.error('Error updating data:', err);
                            return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
                        }
                        console.log('Data updated successfully:', results);
                        res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
                    });
                })
            };
        });
    });
});

router.post("/edit", function (req, res) {
    const { company_Id, com_name_lao, com_name_eng, com_tel, com_address } = req.body;
    const table = 'oac_company';
    const field = 'com_name_lao,com_name_eng,com_tel,com_address';
    const newData = [com_name_lao, com_name_eng, com_tel, com_address, company_Id];
    const condition = 'company_Id=?';
    db.updateData(table, field, newData, condition, (err, results) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
        }
        console.log('Data updated successfully:', results);
        res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
    });
});


router.delete("/:id", async (req, res) => {
    const company_Id = req.params.id;

    const dbWhere = `company_id_fk='${company_Id}'`;
    db.selectWhere('oac_insurance', '*', dbWhere, (err, resDel) => {
        if (err) {
            return res.status(400).json({ message: 'Error while querying the database' });
        }
        if (resDel && resDel.length > 0) {
            return res.status(404).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ' });
        } else {
            const table = 'oac_company';
            const where = `company_Id='${company_Id}'`;
            db.deleteData(table, where, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
                }
                console.log('Data inserted successfully:', results);
                res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
            });
        }
    });
});


router.get("/fetch", function (req, res) {
    db.selectAll('oac_company', (err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});


router.patch("/:id", function (req, res) {
    const id = req.params.id;
    const where = `company_Id=${id}`;
    const fields = `*`;
    db.fetchSingle('oac_company', fields, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});





module.exports = router
