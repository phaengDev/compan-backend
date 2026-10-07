import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Department extends Model {
  declare depat_Id: number;
  declare departName: string | null;
}

Department.init(
  {
    depat_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    departName: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Department",
    tableName: "oac_department",
    timestamps: false,
  }
);

export default Department;
