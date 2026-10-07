import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class ActionInsurance extends Model {
  declare actionId: string;
  declare contract_code_fk: string | null;
  declare currency_id_fk: number | null;
  declare initial_fee: number | null;
  declare percent_taxes: number | null;
  declare money_taxes: number | null;
  declare registration_fee: number | null;
  declare insuranc_included: number | null;
  declare precent_incom: number | null;
  declare pre_tax_profit: number | null;
  declare percent_akorn: number | null;
  declare incom_money: number | null;
  declare incom_finally: number | null;
  declare percent_eps: number | null;
  declare pays_advance_fee: number | null;
  declare percent_fee_eps: number | null;
  declare money_percent_fee: number | null;
  declare expences_pays_taxes: number | null;
  declare net_income: number | null;
  declare status_company: number | null;
  declare company_date: Date | null;
  declare status_agent: number | null;
  declare agent_date: Date | null;
  declare status_oac: number | null;
  declare oac_date: Date | null;
}

ActionInsurance.init(
  {
    actionId: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false
    },
    contract_code_fk: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    currency_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    initial_fee: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    percent_taxes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    money_taxes: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    registration_fee: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    insuranc_included: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    precent_incom: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pre_tax_profit: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    percent_akorn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    incom_money: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    incom_finally: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    percent_eps: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pays_advance_fee: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    percent_fee_eps: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    money_percent_fee: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    expences_pays_taxes: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    net_income: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    status_company: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    company_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status_agent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    agent_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status_oac: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    oac_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "ActionInsurance",
    tableName: "oac_action_insurance",
    timestamps: false,
  }
);

export default ActionInsurance;
