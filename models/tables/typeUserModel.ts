import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class TypeUser extends Model {
  declare type_user_id: string;
  declare type_user_name: string | null;
}

TypeUser.init(
  {
    type_user_id: {
      type: DataTypes.STRING(11),
      primaryKey: true,
      allowNull: false
    },
    type_user_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "TypeUser",
    tableName: "oac_type_user",
    timestamps: false,
  }
);

export default TypeUser;
