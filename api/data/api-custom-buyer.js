const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const currentDatetime = moment();
const dateNow = currentDatetime.format('YYYY-MM-DD');
router.post("/create", function (req, res) {
    let profileName = '';

    const table = 'oac_custom_buyer';
    db.autoId(table, 'custom_uuid', (err, custom_uuid) => {
        const storage = multer.diskStorage({
            destination: function (req, custom_profile, cb) {
                cb(null, './assets/profile');
            },
            filename: function (req, custom_profile, cb) {
                const ext = path.extname(custom_profile.originalname);
                profileName = `profile-${custom_uuid}${ext}`;
                cb(null, profileName);
            }
        });
        const upload = multer({ storage }).single('custom_profile');
        upload(req, res, function (err) {
            const { customUuid, type_buyer_fk, customer_name,  district_fk, village_name, registra_tel } = req.body;

            if(!customUuid){
            const fields = 'custom_uuid, custom_profile, type_buyer_fk,customer_name,district_fk,village_name,registra_tel,status_changs,create_date';
            const data = [custom_uuid, profileName, type_buyer_fk, customer_name,  district_fk, village_name, registra_tel, '1', dateNow];
            db.insertData(table, fields, data, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ message: `ການບັນທຶກຂໍ້ມູນບໍ່ສ້ຳເລັດ` });
                }
                console.log('Data inserted successfully:', results);
                res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', id: custom_uuid });
            });
        }else{

            const where = `custom_uuid='${customUuid}'`;
            db.selectWhere(table, '*', where, (err, results) => {
                if (results[0].custom_profile && results[0].custom_profile !== '' && profileName !== '') {
                    const filePath = path.join('assets/profile/', results[0].custom_profile);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting the existing file:', err);
                        }
                    });
                }
                let fileName=results[0].custom_profile;
                if(profileName !==''){
                    fileName=profileName;
                }
        
            const fields = 'custom_profile,type_buyer_fk,customer_name,district_fk,village_name,registra_tel';
            const newData = [fileName,type_buyer_fk,customer_name,district_fk,village_name,registra_tel,customUuid]; 
            const condition = 'custom_uuid=?'; 
            db.updateData(table, fields, newData, condition, (err, results) => {
                if (err) {
                    console.error('Error updating data:', err);
                    return res.status(500).json({ error: 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ ກະລຸນາກວອສອນແລ້ວລອງໃໝ່ອິກຄັ້ງ' });
                }
                console.log('Data updated successfully:', results);
                res.status(200).json({ message: 'ການແກ້ໄຂຂໍ້ມູນສຳເລັດ', data: results });
            });
        })

        }
        });
    });
});

router.get("/:id", function (req, res, next) {
    const custom_uuid= req.params.id;
    const tables = `oac_custom_buyer
     LEFT JOIN oac_district ON oac_custom_buyer.district_fk=oac_district.district_id 
     LEFT JOIN oac_type_buyer ON oac_custom_buyer.type_buyer_fk=oac_type_buyer.type_buyer_id `;
    const where = `custom_uuid=${custom_uuid}`;
    db.fetchSingleAll(tables, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.get("/option/:id", function (req, res) {
    const type= req.params.id;
    const tables = `oac_custom_buyer`;
    const where = `type_buyer_fk='${type}'`;
    db.selectAllwhere(tables, where, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});


router.post("/all", function (req, res) {
    const tables = `oac_custom_buyer`;
    const where=`status_changs=1`;
    db.selectAllwhere(tables,where,(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

router.get("/cm/:id", function (req, res) {
    const companyId=req.params.id;
    const tables = ` oac_custom_buyer
	LEFT JOIN oac_insurance ON oac_custom_buyer.custom_uuid=oac_insurance.custom_id_fk`;
   const field=` custom_uuid,customer_name`;
    const where=`company_id_fk='${companyId}' GROUP BY custom_id_fk`;
    db.selectWhere(tables,field,where,(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});




router.post("/", function (req, res) {
    const {provinceId,districtId,type_buyerId} = req.body;
    let province_fk='';
    if(provinceId){
        province_fk=`AND province_fk='${provinceId}'`;
    }
    let district_fk='';
    if(districtId){
        district_fk=`AND district_fk='${districtId}'`;
    }
    let  type_buyer_fk='';
    if(type_buyerId){
        type_buyer_fk=`AND type_buyer_fk='${type_buyerId}'`;
    }
    const tables = `oac_custom_buyer
    LEFT JOIN oac_district ON oac_custom_buyer.district_fk=oac_district.district_id
    LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id`;
    const field = `
    custom_uuid,
    type_buyer_fk,
    custom_profile,
    customer_name,
    provice_fk,
    district_fk,
    village_name,
    registra_tel,
    status_changs,
    create_date,
    district_name,
    province_name,
    (SELECT COUNT(custom_id_fk) FROM oac_insurance WHERE custom_id_fk=custom_uuid) AS qtycontart`;
    const wheres=`status_changs='1' ${type_buyer_fk} ${province_fk} ${district_fk}`;
    db.selectWhere(tables, field,wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});


router.delete("/:id", async (req, res) => {
    const custom_uuid = req.params.id;

    const dbWhere = `company_id_fk='${custom_uuid}'`;
    db.selectWhere('oac_insurance', '*', dbWhere, (err, resDel) => {
        if (err) {
            return res.status(400).json({ message: 'Error while querying the database' });
        }
        if (resDel && resDel.length > 0) {
            return res.status(404).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ' });
        } else {
            const table = 'oac_custom_buyer';
            const where = `custom_uuid='${custom_uuid}'`;
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


router.post('/search',function(req, res){
   const {customName}=req.body;
   const tables = `oac_custom_buyer
   LEFT JOIN oac_district ON oac_custom_buyer.district_fk=oac_district.district_id
   LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id`;
   const field = `
   custom_uuid,
   customer_name,
   village_name,
   registra_tel,
   create_date,
   district_name,
   province_name`;
   const wheres=`status_changs='1' AND customer_name LIKE '%${customName}%'`;
   db.selectWhere(tables, field,wheres, (err, results) => {
       if (err) {
           return res.status(400).send();
       }
       res.status(200).json(results);
   });
})


module.exports = router;