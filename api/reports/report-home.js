const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');
const currentDatetime = moment();
const month = currentDatetime.format('MM');
const year = currentDatetime.format('YYYY');
router.post("/balanch", function (req, res) {
    const {user_type,companyId} = req.body;
let company_agent_fk='';
if(user_type===2){
    company_agent_fk=`AND agent_id_fk=${companyId}`;
}else if(user_type===3){
    company_agent_fk=`AND custom_id_fk=${companyId}`;
}
else if(user_type===4){
    company_agent_fk=`AND company_id_fk=${companyId}`;
}

    const table = `oac_insurance 
    LEFT JOIN oac_action_insurance ON oac_insurance.incuranec_code=oac_action_insurance.contract_code_fk
    LEFT JOIN oac_currency ON oac_action_insurance.currency_id_fk=oac_currency.currency_id `;
    const where = `contract_status = '1' 
  AND EXTRACT(YEAR FROM contract_start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
   ${company_agent_fk}`;
    const field = ` COALESCE(SUM(insuranc_included * reate_price), 0) AS insuranc_included,
    COALESCE(SUM(incom_finally * reate_price), 0) AS incom_finally,
    COALESCE(SUM(expences_pays_taxes * reate_price), 0) AS expences_pays_taxes,
    COALESCE(SUM(net_income * reate_price), 0) AS net_income,
    COALESCE(
        (SELECT SUM(expences_pays_taxes * reate_price) 
         FROM oac_insurance
         LEFT JOIN oac_action_insurance ON oac_insurance.incuranec_code=oac_action_insurance.contract_code_fk
         LEFT JOIN oac_currency ON oac_action_insurance.currency_id_fk=oac_currency.currency_id 
         WHERE status_agent = 1 
           AND contract_status='1' 
           AND EXTRACT(YEAR FROM contract_start_date) = EXTRACT(YEAR FROM CURRENT_DATE)  
           ${company_agent_fk}
        ), 0
    ) AS arrears_commit`;
    db.fetchSingle(table, field, where, (err, results) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວ');
        }
        
    const tables = `oac_insurance`;
    const wheres = `contract_status = '1' ${company_agent_fk}`;
    const fields = `COUNT(*) AS qtyAll,
    COUNT(CASE WHEN DATEDIFF(contract_end_date,CURDATE()) <= 0 THEN 1 END) AS run_out,
    COUNT(CASE WHEN DATEDIFF(CURDATE(), contract_end_date) <= 10 AND DATEDIFF(CURDATE(), contract_end_date) >= 1 THEN 1 END) AS qty_almost,
    (SELECT COUNT(*) FROM oac_custom_buyer WHERE status_changs = '1') AS custom_qty`;
    db.fetchSingle(tables, fields, wheres, (err, rescount) => {
        if (err) {
            return res.status(400).send('ການສະແດງຂໍ້ມູນລົມເຫຼວd');
        }
    res.status(200).json({data1:results,data2:rescount});
    });
});
})

// API Endpoint to fetch chart data
router.get('/getChartData', (req, res) => {
    const tables = `(
    SELECT 0 AS n UNION ALL
    SELECT 1 UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11
) AS months
LEFT JOIN oac_insurance ON MONTH(contract_start_date) = MONTH(DATE_ADD(NOW(), INTERVAL n MONTH)) AND  EXTRACT(YEAR FROM contract_start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
 LEFT JOIN oac_action_insurance ON oac_insurance.incuranec_code=oac_action_insurance.contract_code_fk 
 LEFT JOIN oac_currency ON oac_action_insurance.currency_id_fk=oac_currency.currency_id 
  GROUP BY MonthNumber
        ORDER BY MonthNumber`;
    const fields=`MONTH(DATE_ADD(NOW(), INTERVAL n MONTH)) AS MonthNumber,
		 COALESCE(SUM(insuranc_included*reate_price),0) AS insuranc_included, COALESCE(SUM(incom_finally*reate_price),0) AS incom_finally, COALESCE(SUM(expences_pays_taxes*reate_price),0) as expences_pays_taxes, COALESCE(SUM(net_income*reate_price),0) AS net_income 
        `;
    db.selectData(tables,fields, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Failed to fetch data' });
        } else {
            const series = [
                {
                    name: 'ລວມຍອດຂາຍ',
                    data: results.map(row => row.insuranc_included)
                },
                {
                    name: 'ຄອມຮັບ',
                    data: results.map(row => row.incom_finally)
                },
                {
                    name: 'ຄອມຈ່າຍ',
                    data: results.map(row => row.expences_pays_taxes)
                },
                {
                    name: 'ຄອມຮັບສຸດທິ',
                    data: results.map(row => row.net_income)
                }
            ];

            res.json({ series });

        }
    });
});



// API Endpoint to fetch chart data
router.get('/chartAgent/:id', (req, res) => {
    const agent_id_fk=req.params.id;
    const tables = `(
    SELECT 0 AS n UNION ALL
    SELECT 1 UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11
) AS months
LEFT JOIN oac_insurance ON MONTH(contract_start_date) = MONTH(DATE_ADD(NOW(), INTERVAL n MONTH)) AND  EXTRACT(YEAR FROM contract_start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
 LEFT JOIN oac_action_insurance ON oac_insurance.incuranec_code=oac_action_insurance.contract_code_fk 
 LEFT JOIN oac_currency ON oac_action_insurance.currency_id_fk=oac_currency.currency_id 
WHERE agent_id_fk=${agent_id_fk} GROUP BY MonthNumber
        ORDER BY MonthNumber`;
    const fields=`MONTH(DATE_ADD(NOW(), INTERVAL n MONTH)) AS MonthNumber,
		 COALESCE(SUM(insuranc_included*reate_price),0) AS insuranc_included,  COALESCE(SUM(expences_pays_taxes*reate_price),0) as expences_pays_taxes`;
    db.selectData(tables,fields, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Failed to fetch data' });
        } else {
            const series = [
                {
                    name: 'ລວມຍອດຂາຍ',
                    data: results.map(row => row.insuranc_included)
                },
                {
                    name: 'ຄອມຮັບ',
                    data: results.map(row => row.expences_pays_taxes)
                },
            ];

            res.json({ series });

        }
    });
});
  
module.exports = router