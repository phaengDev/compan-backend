import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class DocumentPay extends Model {
  declare docoment_id: number;
  declare contract_code_fk: string | null;
  declare contract_no: string | null;
  declare docom_file: string | null;
  declare status_pay: number | null;
  declare status_doc: number | null;
  declare debt_remark: string | null;
  declare doccm_date: Date | null;
}

DocumentPay.init(
  {
    docoment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    contract_code_fk: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    contract_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    docom_file: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status_pay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_doc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    debt_remark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    doccm_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "DocumentPay",
    tableName: "oac_document_pay",
    timestamps: false,
  }
);

export default DocumentPay;
