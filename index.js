const express = require('express')
const app = express()
const cors = require("cors");
const bodyParser = require('body-parser');
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const path = require("path")
app.use("/image", express.static(path.join(__dirname, "./assets/")))

const typeCars=require('./api/setting/api-type-car');
const brandsCras=require('./api/setting/api-brands-cras');
const typeInsurance=require('./api/setting/api-type-insurance');
const useOptions=require('./api/setting/api-insurance-options');
const useCompany=require('./api/setting/api-company');
const useVersion=require('./api/setting/api-version-cras');
const useUser=require('./api/setting/api-users');
const useDepart=require('./api/setting/api-department');
const useAgent=require('./api/data/api-agent-sale');
const usePorvince=require('./api/setting/api-province');
const useDistrict=require('./api/setting/api-district')
const useInsurance=require('./api/data/api-insurance-v2');
const useCustom=require('./api/data/api-custom-buyer');
const useRerport=require('./api/reports/report-insurance')
const useRerportDebt=require('./api/reports/report-insurance-debt');
const usePaydebt =require('./api/data/api-pays-debt');
const useHome=require('./api/reports/report-home')
const useCurrency=require('./api/setting/api-currency');
const useRetrunIn=require('./api/data/api-inurance-retrun');
const useUpload=require('./api/data/uploadfile');
const useComisget=require('./api/data/api-setcomision');
const useComispay=require('./api/data/api-comisionpay');
const useStatus=require('./api/setting/status-insurance');
const useLogin=require('./api/checklogin');
//===================== use router
app.use('/typecar',typeCars);
app.use('/brands',brandsCras);
app.use('/type-ins',typeInsurance);
app.use('/options',useOptions);
app.use('/company',useCompany);
app.use('/version',useVersion);
app.use('/user',useUser);
app.use('/depart',useDepart);
app.use('/agent',useAgent);
app.use('/province',usePorvince);
app.use('/district',useDistrict);
app.use('/insurance',useInsurance);
app.use('/custom',useCustom);
app.use('/report',useRerport);
app.use('/debt',useRerportDebt);
app.use('/pays',usePaydebt);
app.use('/home',useHome);
app.use('/currency',useCurrency);
app.use('/retrun',useRetrunIn);
app.use('/upload',useUpload);
app.use('/comisget',useComisget);
app.use('/comispay',useComispay);
app.use('/status',useStatus);
app.use('/login',useLogin);

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});