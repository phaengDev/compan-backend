const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const currentDatetime = moment();
const dateNow = currentDatetime.format('YYYY-MM-DD');
router.post("/create", function (req, res) {
    const { agentId, idcrad_code, agent_name, agent_dob, district_id_fk, agent_village, agent_tel } = req.body;
    const table = 'oac_agent_sale';
    if (!agentId) {
        db.autoId(table, 'agent_Id', (err, agent_Id) => {
            const fields = 'agent_Id,idcrad_code,agent_name,agent_dob,district_id_fk,agent_village,agent_tel,agent_status, create_date';
            const data = [agent_Id, idcrad_code, agent_name, agent_dob, district_id_fk, agent_village, agent_tel, '1', dateNow];
            db.insertData(table, fields, data, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                }
                console.log('Data inserted successfully:', results);
                res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
            });
        });
    } else {
        const fields = `idcrad_code,agent_name,agent_dob,district_id_fk,agent_village,agent_tel`;
        const newData = [idcrad_code, agent_name, agent_dob, district_id_fk, agent_village, agent_tel, agentId];
        const condition = 'agent_Id=?';
        db.updateData(table, fields, newData, condition, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
            }
            console.log('Data inserted successfully:', results);
            res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
        });
    }
});



router.get("/", function (req, res) {
    const tables = `oac_agent_sale
    LEFT JOIN oac_district ON oac_agent_sale.district_id_fk=oac_district.district_id
    LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id`;
    const field = `*,(SELECT COUNT(agent_id_fk) FROM oac_insurance WHERE agent_id_fk=agent_Id) AS qtycontart`;
    const wheres=`agent_status='1'`;
    db.selectWhere(tables, field,wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.get("/option", function (req, res, next) {
    const tables = `oac_agent_sale`;
    db.selectAll(tables, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});
router.delete("/:id", function (req, res) {
    const agent_Id = req.params.id;
    const dbWhere = `agent_id_fk='${agent_Id}'`;
    db.selectWhere('oac_insurance', '*', dbWhere, (err, resDel) => {
        if (err) {
            return res.status(400).json({ message: 'Error while querying the database' });
        }
        if (resDel && resDel.length > 0) {
            return res.status(404).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ' });
        } else {
            const tables = `oac_agent_sale`;
            const wheres = `agent_Id='${agent_Id}'`;
            db.deleteData(tables, wheres, (err, results) => {
                if (err) {
                    return res.status(400).json({ message: 'Error while deleting the agent' });
                }
                res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ' });
            });
        }
    });
})

module.exports = router;