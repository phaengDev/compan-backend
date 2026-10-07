import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class TypeInsurance extends Model {
  declare type_insid: number;
  declare status_ins: number | null;
  declare type_in_name: string | null;
}

TypeInsurance.init(
  {
    type_insid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    status_ins: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type_in_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "TypeInsurance",
    tableName: "oac_type_insurance",
    timestamps: false,
  }
);

export default TypeInsurance;
