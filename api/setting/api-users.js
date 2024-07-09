const express=require('express');
const router=express.Router();
const db = require('../db');
const bcrypt=require('bcryptjs');
// const { v4: uuidv4 } = require('uuid')
const moment = require('moment');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');
router.post("/create", function (req, res) {
    // const uuid_user=uuidv4();
    const table = 'oac_user_account'; // Table name
   db.autoId(table, 'user_Id', (err, user_Id) => {
    const userPassword = bcrypt.hashSync(req.body.userPassword);
    const {userId,user_type_fk,company_agent_fk,depart_id_fk,userName,userEmail,statusUse,statusOff} = req.body;
    if(!userId){
    const fields = 'user_Id,user_type_fk,company_agent_fk,depart_id_fk,userName,userEmail,userPassword,statusUse,statusOff,userCreate';
    const data = [user_Id,user_type_fk,company_agent_fk,depart_id_fk,userName,userEmail,userPassword,statusUse,statusOff,dateTime];
    db.insertData(table, fields, data, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
}else{
    const table = 'oac_user_account';
    const fields = `user_type_fk,company_agent_fk,depart_id_fk,userName,userEmail,statusOff`;
    const newData = [user_type_fk,company_agent_fk,depart_id_fk,userName,userEmail,statusOff,userId];
    const condition = 'user_Id=?';  
    db.updateData(table, fields,newData, condition, (err, results) => {
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

router.post("/editpass", function (req, res) {
    const userPassword = bcrypt.hashSync(req.body.userPassword);
    const {userId,userEmail}= req.body;
    const table = 'oac_user_account';
    const fields = `userEmail,userPassword`;
    const newData = [userEmail,userPassword,userId];
    const condition = 'user_Id=?';  
    db.updateData(table, fields,newData, condition, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
})


router.delete("/:id", async (req, res)=> {
    const user_Id= req.params.id;
    const table = 'oac_user_account';
    const where = `user_Id=${user_Id}`;
    db.deleteData(table, where, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ message: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
        }
        console.log('Data inserted successfully:', results);
        res.status(200).json({ message: 'ການດຳເນີນງານສຳເລັດແລ້ວ', data: results });
    });
});

router.get("/oac", function (req, res) {
    const where=`user_type_fk=1`;
    const fields=`user_Id,userName,
    userEmail,
    userPassword,
    statusUse,
    statusOff,
    CASE statusUse
    WHEN '1' THEN 'Admin'
    ELSE 'User'
    END AS statusName,
    CASE statusOff
    WHEN '1' THEN 'ເປິດໃຊ້ງານ'
    ELSE 'ປິດໃຊ້ງານ'
    END AS offName,
    userCreate,
	departName,
    depart_id_fk,
    company_agent_fk`;
    const tables=`oac_user_account
    LEFT JOIN oac_department on oac_user_account.depart_id_fk=oac_department.depat_Id`;
    db.selectWhere(tables,fields,where,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});


router.get("/agent", function (req, res) {
    const where=`user_type_fk=2`;
    const fields=`user_Id,userName,
    userEmail,
    userPassword,
    statusUse,
    statusOff,
    CASE statusOff
    WHEN '1' THEN 'ເປິດໃຊ້ງານ'
    ELSE 'ປິດໃຊ້ງານ'
    END AS offName,
    userCreate,
	agent_name,
    company_agent_fk`;
    const tables=`oac_user_account
    LEFT JOIN oac_agent_sale on oac_user_account.company_agent_fk=oac_agent_sale.agent_Id`;
    db.selectWhere(tables,fields,where,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});
router.get("/buy", function (req, res) {
    const where=`user_type_fk=3`;
    const fields=`user_Id,userName,
    userEmail,
    userPassword,
    statusUse,
    statusOff,
    CASE statusOff
    WHEN '1' THEN 'ເປິດໃຊ້ງານ'
    ELSE 'ປິດໃຊ້ງານ'
    END AS offName,
    userCreate,
	customer_name,
    company_agent_fk`;
    const tables=`oac_user_account
    LEFT JOIN oac_custom_buyer on oac_user_account.company_agent_fk=oac_custom_buyer.customer_Id`;
    db.selectWhere(tables,fields,where,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});


router.get("/cmn", function (req, res) {
    const where=`user_type_fk=4`;
    const fields=`user_Id,
    userName,
    userEmail,
    userPassword,
    statusUse,
    statusOff,
    CASE statusOff
    WHEN '1' THEN 'ເປິດໃຊ້ງານ'
    ELSE 'ປິດໃຊ້ງານ'
    END AS offName,
    userCreate,
	com_name_lao,
    com_name_eng,
    company_agent_fk`;
    const tables=`oac_user_account
    LEFT JOIN oac_company on oac_user_account.company_agent_fk=oac_company.company_Id`;
    db.selectWhere(tables,fields,where,(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});

router.get("/:id", function (req, res) {
  const user_Id= req.params.id;
    const where=`user_Id='${user_Id}'`;
    db.fetchSingleAll('oac_user_account',fields, where,(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

module.exports=router

