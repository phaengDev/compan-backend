import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class UserAccount extends Model {
  declare user_Id: number;
  declare user_type_fk: number | null;
  declare company_agent_fk: number | null;
  declare depart_id_fk: number | null;
  declare userName: string | null;
  declare userEmail: string | null;
  declare userPassword: string | null;
  declare statusUse: number | null;
  declare statusOff: number | null;
  declare userCreate: Date | null;
}

UserAccount.init(
  {
    user_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_type_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    company_agent_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    depart_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userEmail: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userPassword: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    statusUse: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    statusOff: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userCreate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "UserAccount",
    tableName: "oac_user_account",
    timestamps: false,
  }
);

export default UserAccount;
