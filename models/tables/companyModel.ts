import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Company extends Model {
  declare company_Id: number;
  declare com_logo: string | null;
  declare com_name_lao: string | null;
  declare com_name_eng: string | null;
  declare com_tel: string | null;
  declare com_address: string | null;
  declare com_status: number | null;
}

Company.init(
  {
    company_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    com_logo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    com_name_lao: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    com_name_eng: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    com_tel: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    com_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    com_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Company",
    tableName: "oac_company",
    timestamps: false,
  }
);

export default Company;
