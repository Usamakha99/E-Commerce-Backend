const db = require("../config/db");
const { Op } = require("sequelize");
const AIAgent = db.AIAgent;
const AICategory = db.AICategory;
const DeliveryMethod = db.DeliveryMethod;
const Publisher = db.Publisher;

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Create AI Agent
exports.createAIAgent = async (req, res) => {
  try {
    const {
      name,
      provider,
      logo,
      shortDescription,
      description,
      overview,
      highlights,
      badges,
      videoThumbnail,
      rating,
      awsReviews,
      externalReviews,
      freeTrial,
      deployedOnAWS,
      awsFreeTier,
      deliveryMethodId,
      publisherId,
      featuresContent,
      resourcesContent,
      supportContent,
      productComparisonContent,
      pricingContent,
      soldBy,
      categoryIds,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Agent name is required" });
    }

    // Generate slug if not provided
    const slug = req.body.slug || generateSlug(name);

    // Check if agent with same name or slug already exists
    const existingAgent = await AIAgent.findOne({
      where: {
        [Op.or]: [{ name }, { slug }],
      },
    });

    if (existingAgent) {
      return res.status(400).json({
        success: false,
        error: "Agent with this name or slug already exists",
      });
    }

    const aiAgent = await AIAgent.create({
      name,
      slug,
      provider,
      logo,
      shortDescription,
      description,
      overview,
      highlights: highlights || [],
      badges: badges || [],
      videoThumbnail,
      rating: rating || 0,
      awsReviews: awsReviews || 0,
      externalReviews: externalReviews || 0,
      freeTrial: freeTrial || false,
      deployedOnAWS: deployedOnAWS || false,
      awsFreeTier: awsFreeTier || false,
      deliveryMethodId,
      publisherId,
      featuresContent: featuresContent || {},
      resourcesContent: resourcesContent || {},
      supportContent: supportContent || {},
      productComparisonContent: productComparisonContent || {},
      pricingContent: pricingContent || {},
      soldBy,
    });

    // Associate categories if provided
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      await aiAgent.setCategories(categoryIds);
    }

    // Fetch with associations
    const agentWithAssociations = await AIAgent.findByPk(aiAgent.id, {
      include: [
        { model: AICategory, as: "categories", through: { attributes: [] } },
        { model: DeliveryMethod, as: "deliveryMethod" },
        { model: Publisher, as: "publisher" },
      ],
    });

    res.status(201).json({ success: true, data: agentWithAssociations });
  } catch (err) {
    console.error("Error creating AI agent:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all AI Agents with filtering, search, and pagination
exports.getAIAgents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      categoryIds,
      deliveryMethodId,
      deliveryMethodIds,
      publisherId,
      publisherIds,
      freeTrial,
      deployedOnAWS,
      sortBy = "name",
      sortOrder = "ASC",
      isActive,
    } = req.query;

    const whereClause = {};

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { provider: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Category filter
    if (categoryId) {
      const category = await AICategory.findByPk(categoryId);
      if (category) {
        const agentIds = (await category.getAgents({ attributes: ["id"] })).map((a) => a.id);
        whereClause.id = { [Op.in]: agentIds };
      }
    }

    if (categoryIds) {
      const ids = Array.isArray(categoryIds) ? categoryIds : categoryIds.split(",").map((id) => parseInt(id.trim()));
      const agentsWithCategories = await AIAgent.findAll({
        attributes: ["id"],
        include: [
          {
            model: AICategory,
            as: "categories",
            where: { id: { [Op.in]: ids } },
            through: { attributes: [] },
          },
        ],
      });
      const agentIds = agentsWithCategories.map((a) => a.id);
      whereClause.id = { [Op.in]: agentIds };
    }

    // Delivery method filter
    if (deliveryMethodId) {
      whereClause.deliveryMethodId = deliveryMethodId;
    }

    if (deliveryMethodIds) {
      const ids = Array.isArray(deliveryMethodIds)
        ? deliveryMethodIds
        : deliveryMethodIds.split(",").map((id) => parseInt(id.trim()));
      whereClause.deliveryMethodId = { [Op.in]: ids };
    }

    // Publisher filter
    if (publisherId) {
      whereClause.publisherId = publisherId;
    }

    if (publisherIds) {
      const ids = Array.isArray(publisherIds)
        ? publisherIds
        : publisherIds.split(",").map((id) => parseInt(id.trim()));
      whereClause.publisherId = { [Op.in]: ids };
    }

    // Boolean filters
    if (freeTrial !== undefined) {
      whereClause.freeTrial = freeTrial === "true";
    }

    if (deployedOnAWS !== undefined) {
      whereClause.deployedOnAWS = deployedOnAWS === "true";
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await AIAgent.count({ where: whereClause });

    // Get agents with pagination
    const agents = await AIAgent.findAll({
      where: whereClause,
      include: [
        { model: AICategory, as: "categories", through: { attributes: [] } },
        { model: DeliveryMethod, as: "deliveryMethod" },
        { model: Publisher, as: "publisher" },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: agents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching AI agents:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single AI Agent by ID or slug
exports.getAIAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    let agent;
    if (isNumeric) {
      agent = await AIAgent.findByPk(id, {
        include: [
          { model: AICategory, as: "categories", through: { attributes: [] } },
          { model: DeliveryMethod, as: "deliveryMethod" },
          { model: Publisher, as: "publisher" },
        ],
      });
    } else {
      agent = await AIAgent.findOne({
        where: { slug: id },
        include: [
          { model: AICategory, as: "categories", through: { attributes: [] } },
          { model: DeliveryMethod, as: "deliveryMethod" },
          { model: Publisher, as: "publisher" },
        ],
      });
    }

    if (!agent) {
      return res.status(404).json({ success: false, error: "AI Agent not found" });
    }

    // Increment view count
    await agent.increment("viewCount");

    res.json({ success: true, data: agent });
  } catch (err) {
    console.error("Error fetching AI agent:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update AI Agent
exports.updateAIAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      provider,
      logo,
      shortDescription,
      description,
      overview,
      highlights,
      badges,
      videoThumbnail,
      rating,
      awsReviews,
      externalReviews,
      freeTrial,
      deployedOnAWS,
      awsFreeTier,
      deliveryMethodId,
      publisherId,
      featuresContent,
      resourcesContent,
      supportContent,
      productComparisonContent,
      pricingContent,
      soldBy,
      categoryIds,
      isActive,
    } = req.body;

    const agent = await AIAgent.findByPk(id);

    if (!agent) {
      return res.status(404).json({ success: false, error: "AI Agent not found" });
    }

    // Check if name/slug already exists (excluding current agent)
    if (name && name !== agent.name) {
      const slug = req.body.slug || generateSlug(name);
      const existingAgent = await AIAgent.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [{ name }, { slug }],
        },
      });

      if (existingAgent) {
        return res.status(400).json({
          success: false,
          error: "Agent with this name or slug already exists",
        });
      }

      // Update slug if name changed
      if (!req.body.slug) {
        req.body.slug = slug;
      }
    }

    // Update agent
    await agent.update({
      name,
      slug: req.body.slug || agent.slug,
      provider,
      logo,
      shortDescription,
      description,
      overview,
      highlights,
      badges,
      videoThumbnail,
      rating,
      awsReviews,
      externalReviews,
      freeTrial,
      deployedOnAWS,
      awsFreeTier,
      deliveryMethodId,
      publisherId,
      featuresContent,
      resourcesContent,
      supportContent,
      productComparisonContent,
      pricingContent,
      soldBy,
      isActive,
    });

    // Update categories if provided
    if (categoryIds !== undefined) {
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        await agent.setCategories(categoryIds);
      } else {
        await agent.setCategories([]);
      }
    }

    // Fetch updated agent with associations
    const updatedAgent = await AIAgent.findByPk(id, {
      include: [
        { model: AICategory, as: "categories", through: { attributes: [] } },
        { model: DeliveryMethod, as: "deliveryMethod" },
        { model: Publisher, as: "publisher" },
      ],
    });

    res.json({ success: true, data: updatedAgent });
  } catch (err) {
    console.error("Error updating AI agent:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete AI Agent
exports.deleteAIAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await AIAgent.findByPk(id);

    if (!agent) {
      return res.status(404).json({ success: false, error: "AI Agent not found" });
    }

    await agent.destroy();

    res.json({ success: true, message: "AI Agent deleted successfully" });
  } catch (err) {
    console.error("Error deleting AI agent:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get categories with counts
exports.getCategoriesWithCounts = async (req, res) => {
  try {
    const categories = await AICategory.findAll({
      where: { isActive: true },
      include: [
        {
          model: AIAgent,
          as: "agents",
          where: { isActive: true },
          attributes: ["id"],
          through: { attributes: [] },
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });

    const categoriesWithCounts = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category.agents ? category.agents.length : 0,
    }));

    res.json({ success: true, data: categoriesWithCounts });
  } catch (err) {
    console.error("Error fetching categories with counts:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get delivery methods with counts
exports.getDeliveryMethodsWithCounts = async (req, res) => {
  try {
    const deliveryMethods = await DeliveryMethod.findAll({
      where: { isActive: true },
      include: [
        {
          model: AIAgent,
          as: "agents",
          where: { isActive: true },
          attributes: ["id"],
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });

    const methodsWithCounts = deliveryMethods.map((method) => ({
      id: method.id,
      name: method.name,
      slug: method.slug,
      count: method.agents ? method.agents.length : 0,
    }));

    res.json({ success: true, data: methodsWithCounts });
  } catch (err) {
    console.error("Error fetching delivery methods with counts:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get publishers with counts
exports.getPublishersWithCounts = async (req, res) => {
  try {
    const publishers = await Publisher.findAll({
      where: { isActive: true },
      include: [
        {
          model: AIAgent,
          as: "agents",
          where: { isActive: true },
          attributes: ["id"],
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });

    const publishersWithCounts = publishers.map((publisher) => ({
      id: publisher.id,
      name: publisher.name,
      slug: publisher.slug,
      count: publisher.agents ? publisher.agents.length : 0,
    }));

    res.json({ success: true, data: publishersWithCounts });
  } catch (err) {
    console.error("Error fetching publishers with counts:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

