import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class DocInsurance extends Model {
  declare file_doc_id: number;
  declare contract_code_fk: string | null;
  declare file_insurance: string | null;
  declare create_date: Date | null;
}

DocInsurance.init(
  {
    file_doc_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    contract_code_fk: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    file_insurance: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "DocInsurance",
    tableName: "oac_doc_insurance",
    timestamps: false,
  }
);

export default DocInsurance;
