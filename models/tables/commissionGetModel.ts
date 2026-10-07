import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class CommissionGet extends Model {
  declare comis_oac_id: number;
  declare company_id_fk: number | null;
  declare insurnce_type_fk: number | null;
  declare percent: number | null;
}

CommissionGet.init(
  {
    comis_oac_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    company_id_fk: {
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
    modelName: "CommissionGet",
    tableName: "oac_commision_get",
    timestamps: false,
  }
);

export default CommissionGet;
