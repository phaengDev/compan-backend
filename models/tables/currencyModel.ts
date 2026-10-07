import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Currency extends Model {
  declare currency_id: number;
  declare currency_name: string | null;
  declare currency_icon: string | null;
  declare genus: string | null;
  declare genus_laos: string | null;
  declare reate_price: number | null;
}

Currency.init(
  {
    currency_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    currency_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    currency_icon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    genus: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    genus_laos: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reate_price: {
      type: DataTypes.DECIMAL(11, 0),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Currency",
    tableName: "oac_currency",
    timestamps: false,
  }
);

export default Currency;
