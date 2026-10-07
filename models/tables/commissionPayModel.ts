import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class CommissionPay extends Model {
  declare comis_agent_id: number;
  declare company_id_fk: number | null;
  declare agent_id_fk: number | null;
  declare insurnce_type_fk: number | null;
  declare percent: number | null;
}

CommissionPay.init(
  {
    comis_agent_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    insurnce_type_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    percent: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "CommissionPay",
    tableName: "oac_commision_pay",
    timestamps: false,
  }
);

export default CommissionPay;
