const express=require('express');
const router=express.Router();
const db = require('../db');
router.post("/create", function (req, res) {
    const {typecarId,typecar_name} = req.body;
    const table = 'oac_type_cras';
    if(!typecarId){
    db.autoId(table, 'typecar_Id', (err, typecar_Id) => {
    const fields = 'typecar_Id, typecar_name';
    const data = [typecar_Id, typecar_name];
    db.insertData(table, fields, data, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ`  });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});
    }else{
        const field = 'typecar_name';
        const newData = [typecar_name,typecarId]; 
        const condition = 'typecar_Id=?'; 
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

router.delete("/:id", function (req, res, next) {
    const typecar_Id= req.params.id;
    const where=`typecar_Id=${typecar_Id}`;
    db.deleteData('oac_type_cras', where, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ຂໍອະໄພການລືບຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
    });

    router.get("/", function (req, res, next) {
        const tables=`oac_type_cras`;
        db.selectAll(tables, (err, results) => {
            if (err) {
                return res.status(400).send();
            }
            res.status(200).json(results);
        });
        });

module.exports = router;