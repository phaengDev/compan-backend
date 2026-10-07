import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class CustomBuyer extends Model {
  declare customer_Id: number;
  declare custom_uuid: string | null;
  declare type_buyer_fk: number | null;
  declare custom_profile: string | null;
  declare customer_name: string | null;
  declare district_fk: number | null;
  declare village_name: string | null;
  declare registra_tel: string | null;
  declare doc_file: string | null;
  declare status_changs: number | null;
  declare create_date: Date | null;
}

CustomBuyer.init(
  {
    customer_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    custom_uuid: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    type_buyer_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    custom_profile: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    district_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    village_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    registra_tel: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    doc_file: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status_changs: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    create_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "CustomBuyer",
    tableName: "oac_custom_buyer",
    timestamps: false,
  }
);

export default CustomBuyer;
