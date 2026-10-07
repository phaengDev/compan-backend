import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class FilepayRefund extends Model {
  declare file_id: number;
  declare contract_id_fk: number | null;
  declare status_pay: number | null;
  declare file_doct: string | null;
  declare desciption: string | null;
  declare file_dates: Date | null;
}

FilepayRefund.init(
  {
    file_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    contract_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_pay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    file_doct: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    desciption: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_dates: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "FilepayRefund",
    tableName: "tbl_filepay_refund",
    timestamps: false,
  }
);

export default FilepayRefund;
