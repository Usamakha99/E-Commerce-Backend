const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AIAgent = sequelize.define(
    "AIAgent",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      provider: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logo: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      overview: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      highlights: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      badges: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      videoThumbnail: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0,
      },
      awsReviews: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      externalReviews: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      freeTrial: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deployedOnAWS: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      awsFreeTier: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deliveryMethodId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      publisherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Tab Content - Features
      featuresContent: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      // Tab Content - Resources
      resourcesContent: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      // Tab Content - Support
      supportContent: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      // Tab Content - Product Comparison
      productComparisonContent: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      // Tab Content - Pricing
      pricingContent: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      // Additional metadata
      soldBy: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "ai_agents",
      timestamps: true,
    }
  );

  AIAgent.associate = (models) => {
    // Many-to-many relationship with Categories
    AIAgent.belongsToMany(models.AICategory, {
      through: "AIAgentCategories",
      foreignKey: "aiAgentId",
      otherKey: "categoryId",
      as: "categories",
    });

    // Many-to-one relationship with DeliveryMethod
    AIAgent.belongsTo(models.DeliveryMethod, {
      foreignKey: "deliveryMethodId",
      as: "deliveryMethod",
    });

    // Many-to-one relationship with Publisher
    AIAgent.belongsTo(models.Publisher, {
      foreignKey: "publisherId",
      as: "publisher",
    });
  };

  return AIAgent;
};

