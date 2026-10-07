import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class AgentSale extends Model {
  declare agent_Id: number;
  declare idcrad_code: string | null;
  declare agent_name: string | null;
  declare agent_dob: Date | null;
  declare district_id_fk: number | null;
  declare agent_village: string | null;
  declare agent_tel: string | null;
  declare agent_status: number | null;
  declare create_date: Date | null;
}

AgentSale.init(
  {
    agent_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    idcrad_code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    agent_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    agent_dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    district_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    agent_village: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    agent_tel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    agent_status: {
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
    modelName: "AgentSale",
    tableName: "oac_agent_sale",
    timestamps: false,
  }
);

export default AgentSale;
