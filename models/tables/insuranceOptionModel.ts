import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class InsuranceOption extends Model {
  declare options_Id: number;
  declare insurance_type_fk: number | null;
  declare options_name: string | null;
  declare option_vat: number | null;
}

InsuranceOption.init(
  {
    options_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    insurance_type_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    options_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    option_vat: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "InsuranceOption",
    tableName: "oac_insurance_options",
    timestamps: false,
  }
);

export default InsuranceOption;
