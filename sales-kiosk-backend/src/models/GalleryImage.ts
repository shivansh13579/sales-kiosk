import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface GalleryImageAttributes {
  id: number;
  title: string;
  imageUrl: string;
}

type GalleryImageCreationAttributes = Optional<GalleryImageAttributes, "id">;

export class GalleryImage
  extends Model<GalleryImageAttributes, GalleryImageCreationAttributes>
  implements GalleryImageAttributes
{
  public id!: number;
  public title!: string;
  public imageUrl!: string;
}

GalleryImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "gallery_images",
    timestamps: true,
  }
);
