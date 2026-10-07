import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class TypeBuyer extends Model {
  declare type_buyer_id: number;
  declare type_buyer_name: string | null;
}

TypeBuyer.init(
  {
    type_buyer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    type_buyer_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "TypeBuyer",
    tableName: "oac_type_buyer",
    timestamps: false,
  }
);

export default TypeBuyer;
