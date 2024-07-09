const express=require('express');
const router=express.Router();
const db = require('../db');

router.get("/", function (req, res) {
    db.selectAll('oac_department',(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});
router.get("/:id", function (req, res) {
    const id= req.params.id;
    const where=`depat_Id=${id}`;
    db.fetchSingleAll('oac_department', where,(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});

module.exports=router