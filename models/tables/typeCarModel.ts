import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class TypeCar extends Model {
  declare typecar_Id: number;
  declare typecar_name: string | null;
}

TypeCar.init(
  {
    typecar_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    typecar_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "TypeCar",
    tableName: "oac_type_cras",
    timestamps: false,
  }
);

export default TypeCar;
