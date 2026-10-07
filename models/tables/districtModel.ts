import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class District extends Model {
  declare district_id: number;
  declare provice_fk: number | null;
  declare district_name: string | null;
}

District.init(
  {
    district_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    provice_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    district_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "District",
    tableName: "oac_district",
    timestamps: false,
  }
);

export default District;
