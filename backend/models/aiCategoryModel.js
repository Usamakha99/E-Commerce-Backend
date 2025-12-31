const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AICategory = sequelize.define(
    "AICategory",
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
      tableName: "ai_categories",
      timestamps: true,
    }
  );

  AICategory.associate = (models) => {
    // Many-to-many relationship with AIAgents
    AICategory.belongsToMany(models.AIAgent, {
      through: "AIAgentCategories",
      foreignKey: "categoryId",
      otherKey: "aiAgentId",
      as: "agents",
    });
  };

  return AICategory;
};

