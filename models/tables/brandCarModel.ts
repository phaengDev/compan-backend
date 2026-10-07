import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class BrandCar extends Model {
  declare brands_Id: number;
  declare brands_name: string | null;
}

BrandCar.init(
  {
    brands_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    brands_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "BrandCar",
    tableName: "oac_brands_cras",
    timestamps: false,
  }
);

export default BrandCar;
