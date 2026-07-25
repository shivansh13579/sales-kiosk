import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface BookingAttributes {
  id: number;
  unitId: number;
  customerName: string;
  phoneNumber: string;
}

type BookingCreationAttributes = Optional<BookingAttributes, "id">;

export class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: number;
  public unitId!: number;
  public customerName!: string;
  public phoneNumber!: string;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // A unique constraint here is the second line of defense: even if two
      // transactions somehow both thought the unit was free, only one INSERT
      // can succeed against this column.
      unique: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "bookings",
    timestamps: true,
  }
);
