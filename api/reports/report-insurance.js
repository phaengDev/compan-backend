const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
router.post("/all", function (req, res) {
    const { start_date, end_date, company_id_fk, insurance_type_fk, agent_id_fk, type_buyer_fk, option_id_fk } = req.body;
   const startDate=moment(start_date).format('YYYY-MM-DD');
   const endDate=moment(end_date).format('YYYY-MM-DD');

let companyId_fk='';
if (company_id_fk) {
    companyId_fk=`AND company_id_fk='${company_id_fk}'`;
}
let insurance_typeId='';
if (insurance_type_fk) {
    insurance_typeId=`AND insurance_type_fk='${insurance_type_fk}'`;
}
let agentId_fk='';
if (agent_id_fk) {
    agentId_fk=`AND agent_id_fk='${agent_id_fk}'`;
}
let type_buyerId='';
if (type_buyer_fk) {
    type_buyerId=`AND type_buyer_fk='${type_buyer_fk}'`;
}
let optionId_fk='';
if (option_id_fk) {
    optionId_fk=`AND option_id_fk='${option_id_fk}'`;
}
let conditions=`${companyId_fk} ${insurance_typeId} ${agentId_fk} ${type_buyerId} ${optionId_fk}`;

    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='1' AND contract_start_date BETWEEN '${startDate}' AND '${endDate}' ${conditions}`;
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

                db.selectWhere('oac_document_pay', '*', whereDoc, (err, resultsPay) => {
                    if (err) {
                        return reject(err);
                    }
                    contract.file_comits = resultsPay;
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


router.post("/data", function (req, res) {
    const {start_date, end_date,status,statusDay,day_contract, company_id_fk, insurance_type_fk, agent_id_fk, type_buyer_fk, option_id_fk } = req.body;
   const startDate=moment(start_date).format('YYYY-MM-DD');
   const endDate=moment(end_date).format('YYYY-MM-DD');

let companyId_fk='';
if (company_id_fk) {
    companyId_fk=`AND company_id_fk='${company_id_fk}'`;
}
let insurance_typeId='';
if (insurance_type_fk) {
    insurance_typeId=`AND insurance_type_fk='${insurance_type_fk}'`;
}
let agentId_fk='';
if (agent_id_fk) {
    agentId_fk=`AND agent_id_fk='${agent_id_fk}'`;
}
let type_buyerId='';
if (type_buyer_fk) {
    type_buyerId=`AND type_buyer_fk='${type_buyer_fk}'`;
}
let optionId_fk='';
if (option_id_fk) {
    optionId_fk=`AND option_id_fk='${option_id_fk}'`;
}
let dayContract='';
if(day_contract){
    if(statusDay===1){
    dayContract=`AND day_contract <=${day_contract} AND day_contract >=1`;
    }else{
        dayContract=`AND day_contract <=${day_contract}`;
    }
}

let conditions=`${dayContract} ${companyId_fk} ${insurance_typeId} ${agentId_fk} ${type_buyerId} ${optionId_fk}`;

let searchDate='';
if(start_date && end_date ){
    searchDate =`AND contract_end_date BETWEEN '${startDate}' AND '${endDate}'`;
}

    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='${status}' ${searchDate} ${conditions}`;
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
                db.selectWhere('oac_document_pay', '*', whereDoc, (err, resultsPay) => {
                    if (err) {
                        return reject(err);
                    }
                    contract.file_comits = resultsPay;
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

router.post("/notific", function (req, res) {
    const {user_type,companyId} = req.body;
    let company_agent_fk=``;
    if(user_type===2){
        company_agent_fk=`AND agent_id_fk=${companyId}`;
    }else if(user_type===3){
        company_agent_fk=`AND custom_id_fk=${companyId}`;
    }else if(user_type===4){
        company_agent_fk=`AND company_id_fk=${companyId}`;
    }

    const tables = `view_insurance_all`;
    const fields = `*`;
    const wheres = `contract_status='1' AND day_contract <=10 AND day_contract >=1 ${company_agent_fk}`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    })
});

router.post("/move", function (req, res) {
    const {custom_id_fk,company_id_fk, insurance_type_fk, agent_id_fk, option_id_fk } = req.body;
    
    let companyId_fk='';
    if (company_id_fk) {
        companyId_fk=`AND company_id_fk='${company_id_fk}'`;
    }
    let insurance_typeId='';
    if (insurance_type_fk) {
        insurance_typeId=`AND insurance_type_fk='${insurance_type_fk}'`;
    }
    let agentId_fk='';
    if (agent_id_fk) {
        agentId_fk=`AND agent_id_fk='${agent_id_fk}'`;
    }
 
    let optionId_fk='';
    if (option_id_fk) {
        optionId_fk=`AND option_id_fk='${option_id_fk}'`;
    }

   let conditions=`${companyId_fk} ${insurance_typeId} ${agentId_fk} ${optionId_fk}`;
    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='1' AND   custom_id_fk='${custom_id_fk}'  ${conditions}`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    })
});



module.exports = router;