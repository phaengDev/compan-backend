const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
router.post("/company", function (req, res) {
    const { start_date, end_date, company_id_fk, agent_id_fk,status_pay} = req.body;
   const startDate=moment(start_date).format('YYYY-MM-DD');
   const endDate=moment(end_date).format('YYYY-MM-DD');
   const datePays='';
if(start_date && end_date){
    if(status_pay===1){
        datePays =`AND contract_start_date BETWEEN '${startDate}' AND '${endDate}'`;
    }else{
        datePays =`AND company_date BETWEEN '${startDate}' AND '${endDate}'`;
    }
}

let companyId_fk='';
if (company_id_fk) {
    companyId_fk=`AND company_id_fk='${company_id_fk}'`;
}

let agentId_fk='';
if (agent_id_fk) {
    agentId_fk=`AND agent_id_fk='${agent_id_fk}'`;
}
let conditions=`${datePays} ${companyId_fk} ${agentId_fk}`;

    const tables = `view_insurance_all`;
    const fields = `*`;
    const wheres = `contract_status='1' AND status_company='${status_pay}' ${conditions}`;
    const fieldFile=`*,SUBSTRING_INDEX(file_insurance, '.', -1) AS ext_name`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        const promises = results.map(contract => {
            const whereDoc = `contract_code_fk = '${contract.incuranec_code}'`;
            return new Promise((resolve, reject) => {
                db.selectWhere('oac_doc_insurance', fieldFile, whereDoc, (err, resultsDoc) => {
                    if (err) {
                        return reject(err);
                    }
                    contract.file_doc = resultsDoc;
                    resolve(contract);
                });
            });
        });
        Promise.all(promises)
        .then(updatedResults => {
            res.status(200).json(updatedResults);
        })
        .catch(error => {
            res.status(400).send();
        });

    })
});

// ========= pay agent
router.post("/agent", function (req, res) {
    const { start_date, end_date, company_id_fk, agent_id_fk,status_pay} = req.body;
   const startDate=moment(start_date).format('YYYY-MM-DD');
   const endDate=moment(end_date).format('YYYY-MM-DD');
  
  
   let datePays='';
if(start_date && end_date){
    if(status_pay===1){
        datePays =`AND contract_start_date BETWEEN '${startDate}' AND '${endDate}'`;
    }else{
        datePays =`AND agent_date BETWEEN '${startDate}' AND '${endDate}'`;
    }
}

let companyId_fk='';
if (company_id_fk) {
    companyId_fk=`AND company_id_fk='${company_id_fk}'`;
}

    let agentId_fk='';
    if (agent_id_fk) {
        agentId_fk=`AND agent_id_fk='${agent_id_fk}'`;
    }
    let conditions=`${datePays} ${companyId_fk} ${agentId_fk}`;

    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='1' AND  status_agent='${status_pay}' ${conditions}`;
    const fieldFile=`*,SUBSTRING_INDEX(file_insurance, '.', -1) AS ext_name`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
       
        const promises = results.map(contract => {
            const whereDoc = `contract_code_fk = '${contract.incuranec_code}'`;
            return new Promise((resolve, reject) => {
                db.selectWhere('oac_doc_insurance',fieldFile, whereDoc, (err, resultsDoc) => {
                    if (err) {
                        return reject(err);
                    }
                    contract.file_doc = resultsDoc;
                    resolve(contract);
                });
            });
        });
        Promise.all(promises)
        .then(updatedResults => {
            res.status(200).json(updatedResults);
        })
        .catch(error => {
            res.status(400).send();
        });

    })
});



// ============= oac borkder

router.post("/oac", function (req, res) {
    const { start_date, end_date, company_id_fk, agent_id_fk,status_pay} = req.body;
   const startDate=moment(start_date).format('YYYY-MM-DD');
   const endDate=moment(end_date).format('YYYY-MM-DD');
   
   
   let datePays='';
if(start_date && end_date){
    if(status_pay===1){
        datePays =`AND contract_start_date BETWEEN '${startDate}' AND '${endDate}'`;
    }else{
        datePays =`AND oac_date BETWEEN '${startDate}' AND '${endDate}'`;
    }
}

let companyId_fk='';
if (company_id_fk) {
    companyId_fk=`AND company_id_fk='${company_id_fk}'`;
}

let agentId_fk='';
if (agent_id_fk) {
    agentId_fk=`AND agent_id_fk='${agent_id_fk}'`;
}
let conditions=`${datePays} ${companyId_fk} ${agentId_fk}`;

    const tables = `view_insurance_all`;
    const fields = `*`;
    const wheres = `contract_status='1' AND status_oac='${status_pay}' ${conditions}`;
    const fieldFile=`*,SUBSTRING_INDEX(file_insurance, '.', -1) AS ext_name`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        const promises = results.map(contract => {
            const whereDoc = `contract_code_fk = '${contract.incuranec_code}'`;
            return new Promise((resolve, reject) => {
                db.selectWhere('oac_doc_insurance', fieldFile, whereDoc, (err, resultsDoc) => {
                    if (err) {
                        return reject(err);
                    }
                    contract.file_doc = resultsDoc;
                    resolve(contract);
                });
            });
        });
        Promise.all(promises)
        .then(updatedResults => {
            res.status(200).json(updatedResults);
        })
        .catch(error => {
            res.status(400).send();
        });
    })
});




router.get("/sum", function (req, res) {
const fields=`(SUM(CASE WHEN status_oac = '1' THEN incom_finally*reate_price ELSE 0 END)) AS incom_finally, 
    (SUM(CASE WHEN status_agent = '1' THEN expences_pays_taxes*reate_price ELSE 0 END)) AS expences_pays_taxes,
    (SUM(CASE WHEN status_company = '1' THEN insuranc_included*reate_price ELSE 0 END)) AS insuranc_included`;
    const wheres=`contract_status='1'`;
    db.fetchSingle('view_insurance_all', fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    })
});
module.exports = router;