const express=require('express');
const router=express.Router();
const db = require('../db');

router.get("/", function (req, res) {
    db.selectAll('oac_province',(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});
router.get("/:id", function (req, res) {
    const id= req.params.id;
    const where=`provinceid=${id}`;
    db.fetchSingleAll('oac_province', where,(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});
router.patch("/section/:id", function (req, res) {
    const section= req.params.id;
    const where=`section=${section}`;
    db.selectAllwhere('oac_province', where,(err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(200).json(results);
    });
});
module.exports=router