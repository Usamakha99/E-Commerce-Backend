const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductTag = sequelize.define(
    "ProductTag",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(7), // Hex color code
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "product_tags",
      timestamps: true,
    }
  );

  ProductTag.associate = (models) => {
    // Many-to-many relationship with Products
    ProductTag.belongsToMany(models.Product, {
      through: "ProductTagProducts",
      foreignKey: "productTagId",
      otherKey: "productId",
      as: "products",
    });
  };

  return ProductTag;
};

