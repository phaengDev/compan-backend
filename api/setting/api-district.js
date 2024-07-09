const express=require('express');
const router=express.Router();
const db = require('../db');

router.patch("/", function (req, res) {
    db.selectAll('oac_district',(err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        res.status(200).json(results);
    });
});
router.get("/:id", function (req, res) {
    const id= req.params.id;
    const where=`districtid=${id}`;
    db.fetchSingleAll('oac_district', where,(err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    });
});
router.get("/pv/:id", function (req, res) {
    const pvid= req.params.id;
    const where=`provice_fk=${pvid}`;
    db.selectAllwhere('oac_district', where,(err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(200).json(results);
    });
});


module.exports=router