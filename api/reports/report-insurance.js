const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
router.post("/all", function (req, res) {
    const { start_date, end_date, company_id_fk, insurance_type_fk, agent_id_fk, type_buyer_fk, option_id_fk } = req.body;
    const startDate = moment(start_date).format('YYYY-MM-DD');
    const endDate = moment(end_date).format('YYYY-MM-DD');

    let companyId_fk = '';
    if (company_id_fk) {
        companyId_fk = `AND company_id_fk='${company_id_fk}'`;
    }
    let insurance_typeId = '';
    if (insurance_type_fk) {
        insurance_typeId = `AND insurance_type_fk='${insurance_type_fk}'`;
    }
    let agentId_fk = '';
    if (agent_id_fk) {
        agentId_fk = `AND agent_id_fk='${agent_id_fk}'`;
    }
    let type_buyerId = '';
    if (type_buyer_fk) {
        type_buyerId = `AND type_buyer_fk='${type_buyer_fk}'`;
    }
    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND option_id_fk='${option_id_fk}'`;
    }
    let conditions = `${companyId_fk} ${insurance_typeId} ${agentId_fk} ${type_buyerId} ${optionId_fk}`;

    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='1' AND contract_start_date BETWEEN '${startDate}' AND '${endDate}' ${conditions}`;
    const fieldFile = `*`;

    const tb_beneficiaries = `oac_beneficiaries
LEFT JOIN oac_status_staff ON oac_beneficiaries.status_use=oac_status_staff.stauts_use_id
LEFT JOIN oac_district ON oac_beneficiaries.user_district_fk=oac_district.district_id
LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id`;
    const fileBene = `oac_beneficiaries._id, 
	oac_beneficiaries.insurance_id_fk, 
	oac_beneficiaries.no_contract, 
	oac_beneficiaries.user_fname, 
	oac_beneficiaries.user_lname, 
	oac_beneficiaries.user_gender, 
	oac_beneficiaries.user_dob, 
	oac_beneficiaries.user_tel, 
	oac_beneficiaries.user_district_fk, 
	oac_beneficiaries.user_village, 
	oac_beneficiaries.status_use, 
	oac_status_staff.status_name, 
	oac_district.district_name, 
	oac_province.province_name`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }

        const promises = results.map(contract => {
            const whereDoc = `contract_code_fk = '${contract.incuranec_code}'`;
            const whereBene = `insurance_id_fk='${contract.incuranec_code}'`;
            return new Promise((resolve, reject) => {
                const queries = [];
                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere('oac_doc_insurance', fieldFile, whereDoc, (err, resultsDoc) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.file_doc = resultsDoc.length ? resultsDoc : [];
                        resolveQuery();
                    });
                }));


                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere('oac_document_pay', '*', whereDoc, (err, resultsPay) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.file_comits = resultsPay.length ? resultsPay : [];
                        resolveQuery();
                    });
                }));

                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere(tb_beneficiaries, fileBene, whereBene, (err, resultsBene) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.beneficiaries = resultsBene.length ? resultsBene : [];
                        resolveQuery();
                    });
                }));

                Promise.all(queries)
                    .then(() => resolve(contract))
                    .catch(reject);
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

// ==================== custom buyer ============  

router.post("/cbuy", function (req, res) {
    const { start_date, end_date, company_id_fk, insurance_type_fk, custom_id_fk, type_buyer_fk, option_id_fk } = req.body;
    const startDate = moment(start_date).format('YYYY-MM-DD');
    const endDate = moment(end_date).format('YYYY-MM-DD');

    let companyId_fk = '';
    if (company_id_fk) {
        companyId_fk = `AND company_id_fk='${company_id_fk}'`;
    }
    let insurance_typeId = '';
    if (insurance_type_fk) {
        insurance_typeId = `AND insurance_type_fk='${insurance_type_fk}'`;
    }

    let type_buyerId = '';
    if (type_buyer_fk) {
        type_buyerId = `AND type_buyer_fk='${type_buyer_fk}'`;
    }
    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND option_id_fk='${option_id_fk}'`;
    }
    let conditions = `${companyId_fk} ${insurance_typeId}  ${type_buyerId} ${optionId_fk}`;

    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='1' AND contract_start_date BETWEEN '${startDate}' AND '${endDate}' AND custom_id_fk='${custom_id_fk}' ${conditions}`;
    const fieldFile = `*`;

    const tb_beneficiaries = `oac_beneficiaries
LEFT JOIN oac_status_staff ON oac_beneficiaries.status_use=oac_status_staff.stauts_use_id
LEFT JOIN oac_district ON oac_beneficiaries.user_district_fk=oac_district.district_id
LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id`;
    const fileBene = `oac_beneficiaries._id, 
	oac_beneficiaries.insurance_id_fk, 
	oac_beneficiaries.no_contract, 
	oac_beneficiaries.user_fname, 
	oac_beneficiaries.user_lname, 
	oac_beneficiaries.user_gender, 
	oac_beneficiaries.user_dob, 
	oac_beneficiaries.user_tel, 
	oac_beneficiaries.user_district_fk, 
	oac_beneficiaries.user_village, 
	oac_beneficiaries.status_use, 
	oac_status_staff.status_name, 
	oac_district.district_name, 
	oac_province.province_name`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }

        const promises = results.map(contract => {
            const whereDoc = `contract_code_fk = '${contract.incuranec_code}'`;
            const whereBene = `insurance_id_fk='${contract.incuranec_code}'`;
            return new Promise((resolve, reject) => {
                const queries = [];
                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere('oac_doc_insurance', fieldFile, whereDoc, (err, resultsDoc) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.file_doc = resultsDoc.length ? resultsDoc : [];
                        resolveQuery();
                    });
                }));


                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere('oac_document_pay', '*', whereDoc, (err, resultsPay) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.file_comits = resultsPay.length ? resultsPay : [];
                        resolveQuery();
                    });
                }));

                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere(tb_beneficiaries, fileBene, whereBene, (err, resultsBene) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.beneficiaries = resultsBene.length ? resultsBene : [];
                        resolveQuery();
                    });
                }));

                Promise.all(queries)
                    .then(() => resolve(contract))
                    .catch(reject);
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

router.post("/historybuy", function (req, res) {
    const { years_start, years_end, company_id_fk, insurance_type_fk, custom_id_fk, option_id_fk } = req.body;

    let companyId_fk = '';
    if (company_id_fk) {
        companyId_fk = `AND company_id_fk='${company_id_fk}'`;
    }
    let insurance_typeId = '';
    if (insurance_type_fk) {
        insurance_typeId = `AND insurance_type_fk='${insurance_type_fk}'`;
    }

    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND option_id_fk='${option_id_fk}'`;
    }
    let conditions = `${companyId_fk} ${insurance_typeId}   ${optionId_fk}`;

    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='2' AND YEAR(contract_start_date) BETWEEN '${years_start}' AND '${years_end}' AND custom_id_fk='${custom_id_fk}' ${conditions}`;
    const fieldFile = `*`;

    const tb_beneficiaries = `oac_beneficiaries
LEFT JOIN oac_status_staff ON oac_beneficiaries.status_use=oac_status_staff.stauts_use_id
LEFT JOIN oac_district ON oac_beneficiaries.user_district_fk=oac_district.district_id
LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id`;
    const fileBene = `oac_beneficiaries._id, 
	oac_beneficiaries.insurance_id_fk, 
	oac_beneficiaries.no_contract, 
	oac_beneficiaries.user_fname, 
	oac_beneficiaries.user_lname, 
	oac_beneficiaries.user_gender, 
	oac_beneficiaries.user_dob, 
	oac_beneficiaries.user_tel, 
	oac_beneficiaries.user_district_fk, 
	oac_beneficiaries.user_village, 
	oac_beneficiaries.status_use, 
	oac_status_staff.status_name, 
	oac_district.district_name, 
	oac_province.province_name`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }

        const promises = results.map(contract => {
            const whereDoc = `contract_code_fk = '${contract.incuranec_code}'`;
            const whereBene = `insurance_id_fk='${contract.incuranec_code}'`;
            return new Promise((resolve, reject) => {
                const queries = [];
                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere('oac_doc_insurance', fieldFile, whereDoc, (err, resultsDoc) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.file_doc = resultsDoc.length ? resultsDoc : [];
                        resolveQuery();
                    });
                }));


                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere('oac_document_pay', '*', whereDoc, (err, resultsPay) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.file_comits = resultsPay.length ? resultsPay : [];
                        resolveQuery();
                    });
                }));

                queries.push(new Promise((resolveQuery, rejectQuery) => {
                    db.selectWhere(tb_beneficiaries, fileBene, whereBene, (err, resultsBene) => {
                        if (err) {
                            return rejectQuery(err);
                        }
                        contract.beneficiaries = resultsBene.length ? resultsBene : [];
                        resolveQuery();
                    });
                }));

                Promise.all(queries)
                    .then(() => resolve(contract))
                    .catch(reject);
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
// ===========================

router.post("/data", function (req, res) {
    const { start_date, end_date, status, statusDay, day_contract, company_id_fk, insurance_type_fk, agent_id_fk, type_buyer_fk, option_id_fk, custom_id_fk, user_type } = req.body;
    const startDate = moment(start_date).format('YYYY-MM-DD');
    const endDate = moment(end_date).format('YYYY-MM-DD');

    let companyId_fk = '';
    if (company_id_fk) {
        companyId_fk = `AND company_id_fk='${company_id_fk}'`;
    }
    let insurance_typeId = '';
    if (insurance_type_fk) {
        insurance_typeId = `AND insurance_type_fk='${insurance_type_fk}'`;
    }
    let agentId_fk = '';
    if (agent_id_fk && user_type !== 3) {
        agentId_fk = `AND agent_id_fk='${agent_id_fk}'`;
    }
    let customId_fk = '';
    if (user_type === 3) {
        customId_fk = `AND custom_id_fk='${custom_id_fk}'`;
    }

    let type_buyerId = '';
    if (type_buyer_fk) {
        type_buyerId = `AND type_buyer_fk='${type_buyer_fk}'`;
    }
    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND option_id_fk='${option_id_fk}'`;
    }
    let dayContract = '';
    if (day_contract) {
        if (statusDay === 1) {
            dayContract = `AND day_contract <=${day_contract} AND day_contract >=1`;
        } else {
            dayContract = `AND day_contract <=${day_contract}`;
        }
    }

    let conditions = `${dayContract} ${companyId_fk} ${insurance_typeId} ${agentId_fk} ${type_buyerId} ${optionId_fk} ${customId_fk}`;

    let searchDate = '';
    if (start_date && end_date) {
        searchDate = `AND contract_end_date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='${status}' ${searchDate} ${conditions}`;
    const fieldFile = `*`;


    const tb_beneficiaries = `oac_beneficiaries
LEFT JOIN oac_status_staff ON oac_beneficiaries.status_use=oac_status_staff.stauts_use_id
LEFT JOIN oac_district ON oac_beneficiaries.user_district_fk=oac_district.district_id
LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id`;
    const fileBene = `oac_beneficiaries._id, 
	oac_beneficiaries.insurance_id_fk, 
	oac_beneficiaries.no_contract, 
	oac_beneficiaries.user_fname, 
	oac_beneficiaries.user_lname, 
	oac_beneficiaries.user_gender, 
	oac_beneficiaries.user_dob, 
	oac_beneficiaries.user_tel, 
	oac_beneficiaries.user_district_fk, 
	oac_beneficiaries.user_village, 
	oac_beneficiaries.status_use, 
	oac_status_staff.status_name, 
	oac_district.district_name, 
	oac_province.province_name`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }

        const promises = results.map(contract => {
            const whereDoc = `contract_code_fk = '${contract.incuranec_code}'`;

            const whereBene = `insurance_id_fk='${contract.incuranec_code}'`;
            return new Promise((resolve, reject) => {
                db.selectWhere('oac_doc_insurance', fieldFile, whereDoc, (err, resultsDoc) => {
                    if (err) {
                        return reject(err);
                    }
                    contract.file_doc = resultsDoc.length ? resultsDoc : [];
                    resolve(contract);
                });
                db.selectWhere('oac_document_pay', '*', whereDoc, (err, resultsPay) => {
                    if (err) {
                        return reject(err);
                    }
                    contract.file_comits = resultsPay.length ? resultsPay : [];
                    resolve(contract);
                });

                db.selectWhere(tb_beneficiaries, fileBene, whereBene, (err, resultsBene) => {
                    if (err) {
                        return reject(err);
                    }
                    // contract.beneficiaries = resultsBene;
                    contract.beneficiaries = resultsBene.length ? resultsBene : [];
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
    const { user_type, companyId } = req.body;
    let company_agent_fk = ``;
    if (user_type === 2) {
        company_agent_fk = `AND agent_id_fk=${companyId}`;
    } else if (user_type === 3) {
        company_agent_fk = `AND custom_id_fk=${companyId}`;
    } else if (user_type === 4) {
        company_agent_fk = `AND company_id_fk=${companyId}`;
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
    const { custom_id_fk, company_id_fk, insurance_type_fk, agent_id_fk, option_id_fk } = req.body;

    let companyId_fk = '';
    if (company_id_fk) {
        companyId_fk = `AND company_id_fk='${company_id_fk}'`;
    }
    let insurance_typeId = '';
    if (insurance_type_fk) {
        insurance_typeId = `AND insurance_type_fk='${insurance_type_fk}'`;
    }
    let agentId_fk = '';
    if (agent_id_fk) {
        agentId_fk = `AND agent_id_fk='${agent_id_fk}'`;
    }

    let optionId_fk = '';
    if (option_id_fk) {
        optionId_fk = `AND option_id_fk='${option_id_fk}'`;
    }

    let conditions = `${companyId_fk} ${insurance_typeId} ${agentId_fk} ${optionId_fk}`;
    const tables = `view_insurance_all`;
    const fields = `*,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idAuto`;
    const wheres = `contract_status='1' AND   custom_id_fk='${custom_id_fk}' ${conditions}`;
    db.selectWhere(tables, fields, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    })
});


router.get('/bene/:id', function (req, res) {
    const idInsurance = req.params.id;
    const tb_beneficiaries = `oac_beneficiaries
LEFT JOIN oac_status_staff ON oac_beneficiaries.status_use=oac_status_staff.stauts_use_id
LEFT JOIN oac_district ON oac_beneficiaries.user_district_fk=oac_district.district_id
LEFT JOIN oac_province ON oac_district.provice_fk=oac_province.province_id`;
    const fileBene = `oac_beneficiaries._id, 
	oac_beneficiaries.insurance_id_fk, 
	oac_beneficiaries.no_contract, 
	oac_beneficiaries.user_fname, 
	oac_beneficiaries.user_lname, 
	oac_beneficiaries.user_gender, 
	oac_beneficiaries.user_dob, 
	oac_beneficiaries.user_tel, 
    oac_district.provice_fk,
	oac_beneficiaries.user_district_fk, 
	oac_beneficiaries.user_village, 
	oac_beneficiaries.status_use, 
	oac_status_staff.status_name, 
	oac_district.district_name, 
	oac_province.province_name`;
    const wheres = `insurance_id_fk='${idInsurance}'`;
    db.selectWhere(tb_beneficiaries, fileBene, wheres, (err, results) => {
        if (err) {
            return res.status(400).send();
        }
        res.status(200).json(results);
    })
})
module.exports = router;