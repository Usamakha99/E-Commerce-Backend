const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductInquiry = sequelize.define(
    "ProductInquiry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      companyName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      helpType: {
        type: DataTypes.ENUM(
          "pricing",
          "shipping",
          "specs",
          "availability",
          "other"
        ),
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      productName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "in_progress", "resolved", "closed"),
        defaultValue: "pending",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "product_inquiries",
      timestamps: true,
    }
  );

  ProductInquiry.associate = (models) => {
    // Optional: Link to Product if productId is provided
    ProductInquiry.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
      onDelete: "SET NULL",
    });
  };

  return ProductInquiry;
};

