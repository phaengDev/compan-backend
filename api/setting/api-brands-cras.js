const express=require('express');
const router=express.Router();
const db = require('../db');
// const moment = require('moment');
// const jwt = require('../../jwt');

router.post("/create", function (req, res) {
    const {brandsId,brands_name} = req.body;
    const table = 'oac_brands_cras';
    if(!brandsId){
    db.autoId(table, 'brands_Id', (err, brands_Id) => {
    const fields = 'brands_Id,brands_name';
    const data = [brands_Id,brands_name];
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
        const field = 'brands_name';
        const newData = [brands_name,brandsId]; 
        const condition = 'brands_Id=?'; 
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
    const brands_Id= req.params.id;
    const table = 'oac_brands_cras';
    const where = `brands_Id=${brands_Id}`;
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
    db.selectAll('oac_brands_cras',(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});



router.patch("/:id", function (req, res) {
  const brands_Id= req.params.id;
    const where=`brands_Id=${brands_Id}`;
  const fields=`brands_Id,brands_name`;
    db.fetchSingle('oac_brands_cras',fields, where,(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

module.exports=router