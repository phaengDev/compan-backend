import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Beneficiary extends Model {
  declare _id: number;
  declare insurance_id_fk: string | null;
  declare no_contract: string | null;
  declare user_fname: string | null;
  declare user_lname: string | null;
  declare user_gender: string | null;
  declare user_dob: string | null;
  declare user_tel: string | null;
  declare user_district_fk: number | null;
  declare user_village: string | null;
  declare status_use: number | null;
}

Beneficiary.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    insurance_id_fk: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    no_contract: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    user_fname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    user_lname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    user_gender: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    user_dob: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user_tel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user_district_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_village: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status_use: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Beneficiary",
    tableName: "oac_beneficiaries",
    timestamps: false,
  }
);

export default Beneficiary;
