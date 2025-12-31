const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Publisher = sequelize.define(
    "Publisher",
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
      logo: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "publishers",
      timestamps: true,
    }
  );

  Publisher.associate = (models) => {
    // One-to-many relationship with AIAgents
    Publisher.hasMany(models.AIAgent, {
      foreignKey: "publisherId",
      as: "agents",
    });
  };

  return Publisher;
};

