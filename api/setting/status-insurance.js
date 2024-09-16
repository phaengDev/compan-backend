const express=require('express');
const router=express.Router();
const db = require('../db');

router.get("/", function (req, res) {
    db.selectAll('oac_status_staff',(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});
module.exports=router