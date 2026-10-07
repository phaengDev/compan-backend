import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class StatusStaff extends Model {
  declare stauts_use_id: number;
  declare status_name: string | null;
}

StatusStaff.init(
  {
    stauts_use_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    status_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "StatusStaff",
    tableName: "oac_status_staff",
    timestamps: false,
  }
);

export default StatusStaff;
