import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class VersionCar extends Model {
  declare version_Id: number;
  declare version_name: string | null;
}

VersionCar.init(
  {
    version_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    version_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "VersionCar",
    tableName: "oac_version_cras",
    timestamps: false,
  }
);

export default VersionCar;
