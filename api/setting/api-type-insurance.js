const express=require('express');
const router=express.Router();
const db = require('../db');
// const moment = require('moment');
// const jwt = require('../../jwt');

router.post("/create", function (req, res) {
    const {type_ins_Id,status_ins,type_in_name} = req.body;
    const table = 'oac_type_insurance';
    if(!type_ins_Id){
    db.autoId(table, 'type_insid', (err, type_insid) => {
    const fields = 'type_insid,status_ins,type_in_name';
    const data = [type_insid,status_ins,type_in_name];
    db.insertData(table, fields, data, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});
    }else{
    const field = 'status_ins,type_in_name';
    const newData = [status_ins,type_in_name,type_ins_Id]; 
    const condition = 'type_insid=?'; 
    db.updateData(table, field, newData, condition, (err, results) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
        }
        console.log('Data updated successfully:', results);
        res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
    }); 
    }

});



router.delete("/:id", async (req, res)=> {
    const type_insid= req.params.id;
    const table = 'oac_type_insurance';
    const where = `type_insid=${type_insid}`;
    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.get("/", function (req, res) {
    const  field=`type_insid,status_ins,type_in_name,
    (SELECT COUNT(*) FROM oac_insurance_options WHERE insurance_type_fk = oac_type_insurance.type_insid) AS qty_option`;
    db.selectData('oac_type_insurance',field,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});



router.get("/cust/:id", function (req, res) {
    const custId=req.params.id;
    const tables=`oac_insurance
	LEFT JOIN oac_insurance_options ON oac_insurance.option_id_fk = oac_insurance_options.options_Id
	LEFT JOIN oac_type_insurance ON oac_insurance_options.insurance_type_fk = oac_type_insurance.type_insid`;
    const  field=`type_insid,status_ins,type_in_name`;
    const wheres=`oac_insurance.custom_id_fk ='${custId}'  GROUP BY insurance_type_fk`
    db.selectWhere(tables,field,wheres,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});



router.get("/s/:id", function (req, res) {
    const sts= req.params.id;
    const where=`status_ins=${sts}`;
    db.selectAllwhere('oac_type_insurance', where,(err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(200).json(results);
    });
});



router.get("/typebuy", function (req, res) {
    db.selectAll('oac_type_buyer',(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});



router.get("/:id", function (req, res) {
  const type_insid= req.params.id;
    const where=`type_insid=${type_insid}`;
  const fields=`type_insid,status_ins,type_in_name`;
  const table=`oac_type_insurance`;

    db.fetchSingle(table,fields, where,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});

module.exports=router
