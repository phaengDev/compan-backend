import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Insurance extends Model {
  declare insuranec_id: number;
  declare incuranec_code: string | null;
  declare insurance_new_id: string | null;
  declare custom_id_fk: number | null;
  declare company_id_fk: number | null;
  declare agent_id_fk: number | null;
  declare option_id_fk: number | null;
  declare contract_number: string | null;
  declare contract_start_date: Date | null;
  declare contract_end_date: Date | null;
  declare contract_status: number | null;
  declare status_check: number | null;
  declare status_change: number | null;
  declare create_date: Date | null;
  declare create_by: string | null;
}

Insurance.init(
  {
    insuranec_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    incuranec_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    insurance_new_id: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    custom_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    company_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    agent_id_fk: {
      type: DataTypes.INTEGER,
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
    contract_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    contract_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    contract_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_check: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_change: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    create_by: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Insurance",
    tableName: "oac_insurance",
    timestamps: false,
  }
);

export default Insurance;
