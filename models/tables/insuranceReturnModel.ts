import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class InsuranceReturn extends Model {
  declare insurance_retrun_id: number;
  declare company_id_fk: number | null;
  declare agent_id_fk: number | null;
  declare custom_buyer_id_fk: string | null;
  declare option_id_fk: number | null;
  declare contract_number: string | null;
  declare retrun_balance: number | null;
  declare currency_id_fk: number | null;
  declare status_company: number | null;
  declare company_date: Date | null;
  declare percent_agent: number | null;
  declare status_agent: number | null;
  declare agent_date: Date | null;
  declare percent_oac: number | null;
  declare status_oac: number | null;
  declare oac_date: Date | null;
  declare remark_text: string | null;
  declare register_date: Date;
  declare file_doc: string | null;
}

InsuranceReturn.init(
  {
    insurance_retrun_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    company_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    agent_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    custom_buyer_id_fk: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    option_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    contract_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    retrun_balance: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: true
    },
    currency_id_fk: {
      type: DataTypes.INTEGER,
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
    percent_agent: {
      type: DataTypes.INTEGER,
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
    percent_oac: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_oac: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    oac_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    remark_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    register_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    file_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "InsuranceReturn",
    tableName: "oac_insurance_retrun",
    timestamps: false,
  }
);

export default InsuranceReturn;
