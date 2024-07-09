const express=require('express');
const router=express.Router();
const db = require('../db');
const moment = require('moment');
// const jwt = require('../../jwt');

router.post("/create", function (req, res) {
    const {optionsId,insurance_type_fk,options_name,option_vat} = req.body;
    const table = 'oac_insurance_options';
    if(!optionsId){
    db.autoId(table, 'options_Id', (err, options_Id) => {
    const fields = 'options_Id,insurance_type_fk,options_name,option_vat';
    const data = [options_Id,insurance_type_fk,options_name,option_vat];
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
        const field = 'insurance_type_fk,options_name,option_vat';
        const newData = [insurance_type_fk,options_name,option_vat,optionsId]; 
        const condition = 'options_Id=?'; 
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
    const options_Id= req.params.id;
    const table = 'oac_insurance_options';
    const where = `options_Id='${options_Id}'`;
    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.patch("/", function (req, res) {
    db.selectAll('oac_insurance_options',(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});

router.get("/t/:id", function (req, res) {
    const typeId= req.params.id;
    const Where=`insurance_type_fk=${typeId}`;
    const tables=`oac_insurance_options`;
    db.selectAllwhere(tables, Where,(err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(200).json(results);
    });
});

router.patch("/:id", function (req, res) {
  const options_Id= req.params.id;
    const where=`options_Id=${options_Id}`;
  const fields=`options_Id,insurance_type_fk,options_name,option_vat`;
    db.fetchSingle('oac_insurance_options',fields, where,(err, results) => {
    if (err) {
    return res.status(400).send();
    }
    res.status(200).json(results);
    });
});

module.exports=router