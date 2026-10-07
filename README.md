# OAC Info API

Backend API ສຳລັບລະບົບບໍລິຫານປະກັນໄພ OAC Broker: ສັນຍາປະກັນໄພ, ລູກຄ້າ, ຕົວແທນຂາຍ, ຄ່ານາຍໜ້າ, ການຊຳລະໜີ້, ການສົ່ງຄືນ ແລະ ລາຍງານ.

ສ້າງດ້ວຍ **Express + TypeScript + Sequelize + MySQL**.

## ສິ່ງທີ່ຕ້ອງມີ

- Node.js 20 ຂຶ້ນໄປ (ທົດສອບກັບ v22)
- MySQL ທີ່ມີຖານຂໍ້ມູນຂອງລະບົບຢູ່ແລ້ວ (ຕາຕະລາງ `oac_*`). ບໍ່ຕ້ອງມີ view ໃນຖານຂໍ້ມູນ

> API ນີ້ **ບໍ່ສ້າງຕາຕະລາງເອງ** (ບໍ່ໄດ້ໃຊ້ `sequelize.sync()`), ຖານຂໍ້ມູນຕ້ອງມີໂຄງສ້າງພ້ອມກ່ອນ.

## ການຕິດຕັ້ງ

```bash
npm install
cp .env.example .env   # ແລ້ວແກ້ຄ່າໃນ .env
```

## ຕົວແປ `.env`

| ຕົວແປ | ຄຳອະທິບາຍ | ຕົວຢ່າງ |
|---|---|---|
| `DB_HOSTNAME` | Host ຂອງ MySQL | `localhost` |
| `DB_PORT` | Port ຂອງ MySQL | `3306` |
| `DB_NAME` | ຊື່ຖານຂໍ້ມູນ | `insurance_info` |
| `DB_USERNAME` | ຊື່ຜູ້ໃຊ້ MySQL | `root` |
| `DB_PASSWORD` | ລະຫັດຜ່ານ MySQL | |
| `SERVER_PORT` | Port ຂອງ API (ຖ້າບໍ່ມີ ຈະໃຊ້ `PORT`, ແລ້ວຈຶ່ງ `3000`) | `3000` |
| `JWT_SECRET` | Secret ສຳລັບເຊັນ token ຕອນ login | |

> ⚠️ ຊື່ຕົວແປຕ້ອງກົງກັບຕາຕະລາງນີ້ທຸກຕົວອັກສອນ. ຖ້າໃຊ້ຊື່ອື່ນ ເຊັ່ນ `DB_HOST`, `DB_USER`, `DB_PASS`, ລະບົບຈະອ່ານບໍ່ໄດ້ ແລະ ໄປເຊື່ອມຕໍ່ `localhost` ແທນ (ຈະເຫັນ error `ECONNREFUSED`).

## ການເປີດໃຊ້ງານ

| ຄຳສັ່ງ | ໜ້າທີ່ |
|---|---|
| `npm run dev` | ເປີດແບບພັດທະນາ (nodemon + ts-node, reload ອັດຕະໂນມັດເມື່ອແກ້ໄຟລ໌) |
| `npm run build` | Compile TypeScript ໄປໄວ້ໃນ `dist/` |
| `npm start` | ເປີດຈາກ `dist/App.js` (ຕ້ອງ `build` ກ່ອນ) |

ຖ້າເປີດສຳເລັດ ຈະເຫັນ:

```
Database connected!
Server running on http://localhost:3000
```

## ໂຄງສ້າງໂປຣເຈັກ

```
App.ts                  ຈຸດເລີ່ມຕົ້ນ: ຕັ້ງຄ່າ Express, ເຊື່ອມຕໍ່ DB, ເປີດ server
config/database.ts      ການເຊື່ອມຕໍ່ Sequelize/MySQL
router/appRoutes.ts     ລາຍການ route ທັງໝົດ (ຢູ່ພາຍໃຕ້ /api)
controllers/
  auth/                 login
  setting/              ຂໍ້ມູນພື້ນຖານ (ບໍລິສັດ, ປະເພດປະກັນໄພ, ລົດ, ຜູ້ໃຊ້, ແຂວງ/ເມືອງ, ...)
  data/                 ຂໍ້ມູນທຸລະກິດ (ສັນຍາ, ລູກຄ້າ, ຕົວແທນ, ຊຳລະໜີ້, ສົ່ງຄືນ, ຄ່ານາຍໜ້າ, ອັບໂຫຼດ)
  reports/              ລາຍງານ ແລະ ຂໍ້ມູນ dashboard
models/
  tables/               Model ຂອງແຕ່ລະຕາຕະລາງ
  index.ts              ໂຫຼດທຸກ model ແລະ ກຳນົດ association ທັງໝົດ
utils/index.ts          ຟັງຊັນຊ່ວຍສ້າງ ID/ລະຫັດຖັດໄປ (maxid, maxCode)
utils/queryIncludes.ts  include ທີ່ໃຊ້ຫຼາຍບ່ອນ (getContractIncludes, getCustomerInclude, ...) ແລະ ຟັງຊັນວັນທີ
utils/requestHelpers.ts getPagination(): ອ່ານ limit/skip/orderBy/order ຈາກ query string
utils/uploadFile.ts     ຟັງຊັນຊ່ວຍອັບໂຫຼດ/ລຶບໄຟລ໌
utils/autoSync.ts       ປັບຕາຕະລາງໃຫ້ກົງກັບ model
assets/                 ໄຟລ໌ທີ່ອັບໂຫຼດ (logo, profile, docfile, docPay)
uploads/                ໄຟລ໌ static ເພີ່ມເຕີມ
```

## API

ທຸກ route ຢູ່ພາຍໃຕ້ `/api`. ລາຍການເຕັມເບິ່ງໄດ້ທີ່ [router/appRoutes.ts](router/appRoutes.ts).

### Login

```http
POST /api/login/check
Content-Type: application/json

{ "userEmail": "...", "userPassword": "..." }
```

ຖ້າສຳເລັດ ຈະສົ່ງ `token` (JWT, ໝົດອາຍຸໃນ 1 ຊົ່ວໂມງ) ພ້ອມຂໍ້ມູນຜູ້ໃຊ້ (`user_Id`, `username`, `user_type_fk`, `company_agent_fk`, ...).

### ກຸ່ມ route

| Prefix | ໜ້າທີ່ | Controller |
|---|---|---|
| **ຂໍ້ມູນພື້ນຖານ** | | |
| `/typecar` | ປະເພດລົດ | `setting/typeCarController` |
| `/brands` | ຍີ່ຫໍ້ລົດ | `setting/brandsCarsController` |
| `/version` | ລຸ້ນລົດ | `setting/versionCarsController` |
| `/type-ins` | ປະເພດປະກັນໄພ | `setting/typeInsuranceController` |
| `/options` | ທາງເລືອກຂອງປະກັນໄພ | `setting/insuranceOptionsController` |
| `/company` | ບໍລິສັດປະກັນໄພ | `setting/companyController` |
| `/user` | ຜູ້ໃຊ້ລະບົບ | `setting/usersController` |
| `/depart` | ພະແນກ | `setting/departmentController` |
| `/province`, `/district` | ແຂວງ, ເມືອງ | `setting/provinceController`, `setting/districtController` |
| `/currency` | ສະກຸນເງິນ | `setting/currencyController` |
| `/status` | ສະຖານະປະກັນໄພ | `setting/statusInsuranceController` |
| **ຂໍ້ມູນທຸລະກິດ** | | |
| `/agent` | ຕົວແທນຂາຍ | `data/agentSaleController` |
| `/custom` | ລູກຄ້າ (ຜູ້ຊື້ປະກັນ) | `data/customBuyerController` |
| `/insurance` | ສັນຍາປະກັນໄພ, ຕໍ່ອາຍຸ, ຜູ້ຮັບຜົນປະໂຫຍດ | `data/insuranceController` |
| `/pays` | ການຊຳລະໜີ້ | `data/paysDebtController` |
| `/retrun` | ການສົ່ງຄືນເງິນປະກັນໄພ | `data/insuranceReturnController` |
| `/upload` | ອັບໂຫຼດ/ລຶບເອກະສານສັນຍາ | `data/uploadFileController` |
| `/comisget` | ຄ່ານາຍໜ້າທີ່ OAC ໄດ້ຮັບຈາກບໍລິສັດ | `data/commissionGetController` |
| `/comispay` | ຄ່ານາຍໜ້າທີ່ຈ່າຍໃຫ້ຕົວແທນ | `data/commissionPayController` |
| **ລາຍງານ** | | |
| `/report` | ລາຍງານປະກັນໄພ | `reports/insuranceReportController` |
| `/debt` | ລາຍງານໜີ້ | `reports/insuranceDebtReportController` |
| `/home` | ຂໍ້ມູນ ແລະ ກຣາຟໜ້າຫຼັກ | `reports/homeReportController` |
| `/history` | ລາຍງານປະຫວັດ | `reports/historyReportController` |

> ໝາຍເຫດ: route `/retrun` ສະກົດແບບນີ້ແທ້ (ບໍ່ແມ່ນ `return`). ຕອນເອີ້ນໃຊ້ຕ້ອງສະກົດໃຫ້ກົງ.

### ຮູບແບບ response ຂອງລາຍງານ

endpoint ທີ່ສົ່ງເປັນລາຍການ (ລາຍງານ, ໜີ້, ປະຫວັດ, ການສົ່ງຄືນ, ໃບຊຳລະ) ຮັບ query string `?limit=&skip=&orderBy=&order=` (ຄ່າເລີ່ມຕົ້ນ `limit=100`, `skip=0`, `order=ASC`) ແລະ ສົ່ງກັບ:

```json
{
  "data": [
    {
      "incuranec_code": "2027417",
      "contract_number": "...",
      "day_contract": 120,
      "customer": { "customer_name": "...", "url": "http://.../image/profile/...", "district": { "province": { } } },
      "company": { "com_name_lao": "...", "url": "http://.../image/logo/..." },
      "action": { "insuranc_included": "1520000.10", "currency": { "currency_name": "LAK" } },
      "option": { "options_name": "...", "typeInsurance": { "type_in_name": "..." } },
      "agent": { }, "cars": [ ], "documents": [ ], "payments": [ ], "beneficiaries": [ ]
    }
  ],
  "total": 103,
  "meta": { "limit": 100, "skip": 0, "orderBy": "contract_start_date", "order": "ASC" }
}
```

endpoint ທີ່ດຶງລາຍການດຽວ ສົ່ງ `{ "data": { ... } }`, ບໍ່ພົບ → `404 { "error": "..." }`. ກຣາຟໜ້າຫຼັກສົ່ງ `{ "series": [...] }`.

### ການອັບໂຫຼດໄຟລ໌

ໃຊ້ `multipart/form-data`. ໄຟລ໌ຖືກເກັບໄວ້ໃນ `assets/` ແລະ ເປີດເບິ່ງໄດ້ຜ່ານ `/image/<ໂຟນເດີ>/<ຊື່ໄຟລ໌>`, ເຊັ່ນ `/image/logo/xxx.png`.

| ໃຊ້ກັບ | ຊື່ field | ໂຟນເດີ |
|---|---|---|
| ໂລໂກ້ບໍລິສັດ | `com_logo` | `assets/logo` |
| ຮູບລູກຄ້າ | `custom_profile` | `assets/profile` |
| ເອກະສານສັນຍາ | `file_doct` | `assets/docfile` |
| ເອກະສານສົ່ງຄືນ | `file_doc` | `assets/docfile` |
| ອັບໂຫຼດຫຼາຍໄຟລ໌ (`/upload/create`) | `files` | `assets/docfile` |
| ໃບຊຳລະໜີ້ (`/pays`) | `docom_file` | `assets/docPay` |
| ໃບຊຳລະເງິນສົ່ງຄືນ (`/retrun/retrun`) | `file_pay` | `assets/docPay` |

## ຂໍ້ຕົກລົງໃນການຂຽນ code

- **ກຳນົດ association ໄວ້ໃນ [models/index.ts](models/index.ts) ບ່ອນດຽວ.** ຢ່າຂຽນ `belongsTo`/`hasMany` ໃນໄຟລ໌ model ອີກ, ເພາະ Sequelize ຈະ error `You have used the alias ... in two separate associations`.
- **ໃຊ້ຟັງຊັນຂອງ Sequelize ເທົ່ານັ້ນ** (`findAll`, `findOne`, `findAndCountAll`, `count`, `create`, `update`, `destroy`, ...) — ຢ່າຂຽນ SQL ເອງດ້ວຍ `sequelize.query`.
- **endpoint ລາຍການ ຂຽນແບບດຽວກັນ:** `getPagination(req.query, "<ຖັນລຽງ>")` → ສ້າງ `whereCondition` → `Model.findAndCountAll({ where, include, limit, offset: skip, order: [[orderBy, order]], distinct: true })` → `res.status(200).json({ data: rows, total: count, meta: { limit, skip, orderBy, order } })`.
- **include ທີ່ໃຊ້ຫຼາຍບ່ອນ ໃຫ້ສ້າງໄວ້ໃນ [utils/queryIncludes.ts](utils/queryIncludes.ts)** ແລ້ວ import ມາໃຊ້, ຢ່າຂຽນຊ້ຳໃນ controller:
  - `getXxxInclude()`: ດຶງຂໍ້ມູນມາເປັນ object ຊ້ອນ (`getCustomerInclude`, `getCompanyInclude`, `getAgentInclude`, `getOptionInclude`, `getActionInclude`, `getDocumentsInclude`, ...). ສົ່ງເງື່ອນໄຂເຂົ້າໄປໄດ້, ເຊັ່ນ `getOptionInclude({ insurance_type_fk })` — ຄ່າທີ່ວ່າງຈະບໍ່ຖືກກັ່ນຕອງ
  - `getContractIncludes({ customer, action, option, typeInsurance })`: ທຸກຂໍ້ມູນທີ່ກ່ຽວຂ້ອງຂອງສັນຍາ (ແທນ view `view_insurance_all` ເດີມ)
  - hasMany (ລົດ, ເອກະສານ, ໃບຊຳລະ, ຜູ້ຮັບຜົນປະໂຫຍດ, ໄຟລ໌ສົ່ງຄືນ) ໃຊ້ `separate: true` ເພື່ອບໍ່ໃຫ້ `limit` ແລະ `total` ຜິດ
  - `joinXxx()` + `joinCol()`: join ຢ່າງດຽວ ແລ້ວເອົາຖັນມາໄວ້ລະດັບດຽວກັນ (ໃຊ້ກັບ `raw: true`) — ຍັງໃຊ້ຢູ່ໃນ controller ເກົ່າບາງໂຕ
- **ຖັນ `DataTypes.DATE` (ວັນທີ + ເວລາ) ໃຫ້ບັນທຶກຜ່ານ `asDateTime(value)`**, ເຊັ່ນ `create_date: asDateTime(now)`. ຖ້າສົ່ງ string ໃຫ້ Sequelize ໂດຍກົງ ມັນຈະປ່ຽນເປັນ UTC (ເວລາຫຼຸດລົງ 7 ຊົ່ວໂມງ) ບໍ່ກົງກັບຂໍ້ມູນທີ່ມີຢູ່.
- ເງື່ອນໄຂວັນທີ ໃຫ້ໃຊ້ `dateBetween()` / `dayBetween()` / `yearBetween()` ເພື່ອບໍ່ໃຫ້ Sequelize ປ່ຽນ timezone ຂອງຄ່າທີ່ສົມທຽບ.
- ຊື່ຖັນ (column) ຕ້ອງກົງກັບທີ່ປະກາດໃນ model ທຸກຕົວອັກສອນ, ລວມທັງຕົວໃຫຍ່-ນ້ອຍ (ເຊັ່ນ `company_Id`, `agent_Id`, `options_Id`).
- ເມື່ອເພີ່ມ route ໃໝ່: ຂຽນ handler ໃນ `controllers/<ກຸ່ມ>/`, ແລ້ວລົງທະບຽນໃນ `router/appRoutes.ts`.
- ກ່ອນ commit ໃຫ້ກວດ type ດ້ວຍ `npx tsc --noEmit`.
