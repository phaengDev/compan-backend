import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Province extends Model {
  declare province_id: number;
  declare province_name: string | null;
}

Province.init(
  {
    province_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    province_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Province",
    tableName: "oac_province",
    timestamps: false,
  }
);

export default Province;
