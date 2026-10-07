import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class CarInsurance extends Model {
  declare cars_id: number;
  declare cars_code: string | null;
  declare contract_id_fk: string | null;
  declare car_type_id_fk: number | null;
  declare car_brand_id_fk: number | null;
  declare version_name: string | null;
  declare car_registration: string | null;
  declare vehicle_number: string | null;
  declare tank_number: string | null;
  declare createcar_date: Date | null;
}

CarInsurance.init(
  {
    cars_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    cars_code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    contract_id_fk: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    car_type_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    car_brand_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    version_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    car_registration: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    vehicle_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tank_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    createcar_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "CarInsurance",
    tableName: "oac_cars_insurance",
    timestamps: false,
  }
);

export default CarInsurance;
