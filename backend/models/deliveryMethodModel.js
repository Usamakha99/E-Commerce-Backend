const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeliveryMethod = sequelize.define(
    "DeliveryMethod",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "delivery_methods",
      timestamps: true,
    }
  );

  DeliveryMethod.associate = (models) => {
    // One-to-many relationship with AIAgents
    DeliveryMethod.hasMany(models.AIAgent, {
      foreignKey: "deliveryMethodId",
      as: "agents",
    });
  };

  return DeliveryMethod;
};

