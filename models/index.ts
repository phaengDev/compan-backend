import ActionInsurance from "./tables/actionInsuranceModel";
import AgentSale from "./tables/agentSaleModel";
import Beneficiary from "./tables/beneficiaryModel";
import BrandCar from "./tables/brandCarModel";
import CarInsurance from "./tables/carInsuranceModel";
import CommissionGet from "./tables/commissionGetModel";
import CommissionPay from "./tables/commissionPayModel";
import Company from "./tables/companyModel";
import Currency from "./tables/currencyModel";
import CustomBuyer from "./tables/customBuyerModel";
import Department from "./tables/departmentModel";
import District from "./tables/districtModel";
import DocInsurance from "./tables/docInsuranceModel";
import DocumentPay from "./tables/documentPayModel";
import FilepayRefund from "./tables/filepayRefundModel";
import Insurance from "./tables/insuranceModel";
import InsuranceOption from "./tables/insuranceOptionModel";
import InsuranceReturn from "./tables/insuranceReturnModel";
import Province from "./tables/provinceModel";
import StatusStaff from "./tables/statusStaffModel";
import TypeBuyer from "./tables/typeBuyerModel";
import TypeCar from "./tables/typeCarModel";
import TypeInsurance from "./tables/typeInsuranceModel";
import TypeUser from "./tables/typeUserModel";
import UserAccount from "./tables/userAccountModel";
import VersionCar from "./tables/versionCarModel";

Province.hasMany(District, { foreignKey: "provice_fk", sourceKey: "province_id", as: "districts", constraints: false });
District.belongsTo(Province, { foreignKey: "provice_fk", targetKey: "province_id", as: "province", constraints: false });

TypeBuyer.hasMany(CustomBuyer, { foreignKey: "type_buyer_fk", sourceKey: "type_buyer_id", as: "customers", constraints: false });
CustomBuyer.belongsTo(TypeBuyer, { foreignKey: "type_buyer_fk", targetKey: "type_buyer_id", as: "typeBuyer", constraints: false });
District.hasMany(CustomBuyer, { foreignKey: "district_fk", sourceKey: "district_id", as: "customers", constraints: false });
CustomBuyer.belongsTo(District, { foreignKey: "district_fk", targetKey: "district_id", as: "district", constraints: false });

District.hasMany(AgentSale, { foreignKey: "district_id_fk", sourceKey: "district_id", as: "agents", constraints: false });
AgentSale.belongsTo(District, { foreignKey: "district_id_fk", targetKey: "district_id", as: "district", constraints: false });

Company.hasMany(Insurance, {
   foreignKey: "company_id_fk", 
   sourceKey: "company_Id", as: "insurances", 
   constraints: false 
  });
Insurance.belongsTo(Company, { 
  foreignKey: "company_id_fk", 
  targetKey: "company_Id", as: "company", 
  constraints: false 
});
AgentSale.hasMany(Insurance, { 
  foreignKey: "agent_id_fk", 
  sourceKey: "agent_Id", as: "insurances", 
  constraints: false 
});
Insurance.belongsTo(AgentSale, { 
  foreignKey: "agent_id_fk", 
  targetKey: "agent_Id", as: "agent", 
  constraints: false 
});
Insurance.belongsTo(Insurance, {
  foreignKey: "insurance_new_id",
  targetKey: "incuranec_code", as: "newInsurance",
  constraints: false
});
CustomBuyer.hasMany(Insurance, { 
  foreignKey: "custom_id_fk", 
  sourceKey: "custom_uuid", as: "insurances", 
  constraints: false 
});
Insurance.belongsTo(CustomBuyer, { 
  foreignKey: "custom_id_fk", 
  targetKey: "custom_uuid", as: "customer", 
  constraints: false 
});

TypeInsurance.hasMany(InsuranceOption, { 
  foreignKey: "insurance_type_fk", 
  sourceKey: "type_insid", as: "options", 
  constraints: false 
});
InsuranceOption.belongsTo(TypeInsurance, { 
  foreignKey: "insurance_type_fk", 
  targetKey: "type_insid", as: "typeInsurance", 
  constraints: false });
InsuranceOption.hasMany(Insurance, { 
  foreignKey: "option_id_fk", 
  sourceKey: "options_Id", as: "insurances", 
  constraints: false });
Insurance.belongsTo(InsuranceOption, { 
  foreignKey: "option_id_fk", 
  targetKey: "options_Id", as: "option", 
  constraints: false 
});

Insurance.hasOne(ActionInsurance, { foreignKey: "contract_code_fk", sourceKey: "incuranec_code", as: "action", constraints: false });
ActionInsurance.belongsTo(Insurance, { foreignKey: "contract_code_fk", targetKey: "incuranec_code", as: "insurance", constraints: false });
Currency.hasMany(ActionInsurance, { foreignKey: "currency_id_fk", sourceKey: "currency_id", as: "actions", constraints: false });
ActionInsurance.belongsTo(Currency, { foreignKey: "currency_id_fk", targetKey: "currency_id", as: "currency", constraints: false });

Insurance.hasMany(CarInsurance, { foreignKey: "contract_id_fk", sourceKey: "incuranec_code", as: "cars", constraints: false });
CarInsurance.belongsTo(Insurance, { foreignKey: "contract_id_fk", targetKey: "incuranec_code", as: "insurance", constraints: false });
TypeCar.hasMany(CarInsurance, { foreignKey: "car_type_id_fk", sourceKey: "typecar_Id", as: "cars", constraints: false });
CarInsurance.belongsTo(TypeCar, { foreignKey: "car_type_id_fk", targetKey: "typecar_Id", as: "typeCar", constraints: false });
BrandCar.hasMany(CarInsurance, { foreignKey: "car_brand_id_fk", sourceKey: "brands_Id", as: "cars", constraints: false });
CarInsurance.belongsTo(BrandCar, { foreignKey: "car_brand_id_fk", targetKey: "brands_Id", as: "brand", constraints: false });

Insurance.hasMany(DocInsurance, { foreignKey: "contract_code_fk", sourceKey: "incuranec_code", as: "documents", constraints: false });
DocInsurance.belongsTo(Insurance, { foreignKey: "contract_code_fk", targetKey: "incuranec_code", as: "insurance", constraints: false });
Insurance.hasMany(DocumentPay, { foreignKey: "contract_code_fk", sourceKey: "incuranec_code", as: "payments", constraints: false });
DocumentPay.belongsTo(Insurance, { foreignKey: "contract_code_fk", targetKey: "incuranec_code", as: "insurance", constraints: false });

Insurance.hasMany(Beneficiary, { foreignKey: "insurance_id_fk", sourceKey: "incuranec_code", as: "beneficiaries", constraints: false });
Beneficiary.belongsTo(Insurance, { foreignKey: "insurance_id_fk", targetKey: "incuranec_code", as: "insurance", constraints: false });
District.hasMany(Beneficiary, { foreignKey: "user_district_fk", sourceKey: "district_id", as: "beneficiaries", constraints: false });
Beneficiary.belongsTo(District, { foreignKey: "user_district_fk", targetKey: "district_id", as: "district", constraints: false });
StatusStaff.hasMany(Beneficiary, { foreignKey: "status_use", sourceKey: "stauts_use_id", as: "beneficiaries", constraints: false });
Beneficiary.belongsTo(StatusStaff, { foreignKey: "status_use", targetKey: "stauts_use_id", as: "status", constraints: false });

Company.hasMany(CommissionGet, { foreignKey: "company_id_fk", sourceKey: "company_Id", as: "commissionGets", constraints: false });
CommissionGet.belongsTo(Company, { foreignKey: "company_id_fk", targetKey: "company_Id", as: "company", constraints: false });
TypeInsurance.hasMany(CommissionGet, { foreignKey: "insurnce_type_fk", sourceKey: "type_insid", as: "commissionGets", constraints: false });
CommissionGet.belongsTo(TypeInsurance, { foreignKey: "insurnce_type_fk", targetKey: "type_insid", as: "typeInsurance", constraints: false });

Company.hasMany(CommissionPay, { foreignKey: "company_id_fk", sourceKey: "company_Id", as: "commissionPays", constraints: false });
CommissionPay.belongsTo(Company, { foreignKey: "company_id_fk", targetKey: "company_Id", as: "company", constraints: false });
AgentSale.hasMany(CommissionPay, { foreignKey: "agent_id_fk", sourceKey: "agent_Id", as: "commissionPays", constraints: false });
CommissionPay.belongsTo(AgentSale, { foreignKey: "agent_id_fk", targetKey: "agent_Id", as: "agent", constraints: false });
TypeInsurance.hasMany(CommissionPay, { foreignKey: "insurnce_type_fk", sourceKey: "type_insid", as: "commissionPays", constraints: false });
CommissionPay.belongsTo(TypeInsurance, { foreignKey: "insurnce_type_fk", targetKey: "type_insid", as: "typeInsurance", constraints: false });

Company.hasMany(InsuranceReturn, { foreignKey: "company_id_fk", sourceKey: "company_Id", as: "insuranceReturns", constraints: false });
InsuranceReturn.belongsTo(Company, { foreignKey: "company_id_fk", targetKey: "company_Id", as: "company", constraints: false });
AgentSale.hasMany(InsuranceReturn, { foreignKey: "agent_id_fk", sourceKey: "agent_Id", as: "insuranceReturns", constraints: false });
InsuranceReturn.belongsTo(AgentSale, { foreignKey: "agent_id_fk", targetKey: "agent_Id", as: "agent", constraints: false });
CustomBuyer.hasMany(InsuranceReturn, { foreignKey: "custom_buyer_id_fk", sourceKey: "custom_uuid", as: "insuranceReturns", constraints: false });
InsuranceReturn.belongsTo(CustomBuyer, { foreignKey: "custom_buyer_id_fk", targetKey: "custom_uuid", as: "customer", constraints: false });
InsuranceOption.hasMany(InsuranceReturn, { foreignKey: "option_id_fk", sourceKey: "options_Id", as: "insuranceReturns", constraints: false });
InsuranceReturn.belongsTo(InsuranceOption, { foreignKey: "option_id_fk", targetKey: "options_Id", as: "option", constraints: false });
Currency.hasMany(InsuranceReturn, { foreignKey: "currency_id_fk", sourceKey: "currency_id", as: "insuranceReturns", constraints: false });
InsuranceReturn.belongsTo(Currency, { foreignKey: "currency_id_fk", targetKey: "currency_id", as: "currency", constraints: false });
InsuranceReturn.hasMany(FilepayRefund, { foreignKey: "contract_id_fk", sourceKey: "insurance_retrun_id", as: "refundFiles", constraints: false });
FilepayRefund.belongsTo(InsuranceReturn, { foreignKey: "contract_id_fk", targetKey: "insurance_retrun_id", as: "insuranceReturn", constraints: false });

TypeUser.hasMany(UserAccount, { foreignKey: "user_type_fk", sourceKey: "type_user_id", as: "users", constraints: false });
UserAccount.belongsTo(TypeUser, { foreignKey: "user_type_fk", targetKey: "type_user_id", as: "typeUser", constraints: false });
Department.hasMany(UserAccount, { foreignKey: "depart_id_fk", sourceKey: "depat_Id", as: "users", constraints: false });
UserAccount.belongsTo(Department, { foreignKey: "depart_id_fk", targetKey: "depat_Id", as: "department", constraints: false });
UserAccount.belongsTo(Company, { foreignKey: "company_agent_fk", targetKey: "company_Id", as: "company", constraints: false });
UserAccount.belongsTo(AgentSale, { foreignKey: "company_agent_fk", targetKey: "agent_Id", as: "agent", constraints: false });
UserAccount.belongsTo(CustomBuyer, { foreignKey: "company_agent_fk", targetKey: "custom_uuid", as: "customer", constraints: false });

export {
  ActionInsurance,
  AgentSale,
  Beneficiary,
  BrandCar,
  CarInsurance,
  CommissionGet,
  CommissionPay,
  Company,
  Currency,
  CustomBuyer,
  Department,
  District,
  DocInsurance,
  DocumentPay,
  FilepayRefund,
  Insurance,
  InsuranceOption,
  InsuranceReturn,
  Province,
  StatusStaff,
  TypeBuyer,
  TypeCar,
  TypeInsurance,
  TypeUser,
  UserAccount,
  VersionCar,
};

export default {
  ActionInsurance,
  AgentSale,
  Beneficiary,
  BrandCar,
  CarInsurance,
  CommissionGet,
  CommissionPay,
  Company,
  Currency,
  CustomBuyer,
  Department,
  District,
  DocInsurance,
  DocumentPay,
  FilepayRefund,
  Insurance,
  InsuranceOption,
  InsuranceReturn,
  Province,
  StatusStaff,
  TypeBuyer,
  TypeCar,
  TypeInsurance,
  TypeUser,
  UserAccount,
  VersionCar,
};
