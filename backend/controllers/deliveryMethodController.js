const db = require("../config/db");
const { Op } = require("sequelize");
const DeliveryMethod = db.DeliveryMethod;
const AIAgent = db.AIAgent;

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Create Delivery Method
exports.createDeliveryMethod = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Delivery method name is required" });
    }

    const slug = req.body.slug || generateSlug(name);

    const existingMethod = await DeliveryMethod.findOne({
      where: {
        [Op.or]: [{ name }, { slug }],
      },
    });

    if (existingMethod) {
      return res.status(400).json({
        success: false,
        error: "Delivery method with this name or slug already exists",
      });
    }

    const deliveryMethod = await DeliveryMethod.create({
      name,
      slug,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: deliveryMethod });
  } catch (err) {
    console.error("Error creating delivery method:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all Delivery Methods
exports.getDeliveryMethods = async (req, res) => {
  try {
    const { isActive, search, page = 1, limit = 100 } = req.query;
    const whereClause = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const total = await DeliveryMethod.count({ where: whereClause });

    const deliveryMethods = await DeliveryMethod.findAll({
      where: whereClause,
      include: [
        {
          model: AIAgent,
          as: "agents",
          attributes: ["id"],
          required: false,
        },
      ],
      order: [["name", "ASC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    const methodsWithCounts = deliveryMethods.map((method) => ({
      ...method.toJSON(),
      count: method.agents ? method.agents.length : 0,
    }));

    res.json({
      success: true,
      data: methodsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching delivery methods:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single Delivery Method
exports.getDeliveryMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    let deliveryMethod;
    if (isNumeric) {
      deliveryMethod = await DeliveryMethod.findByPk(id, {
        include: [
          {
            model: AIAgent,
            as: "agents",
            attributes: ["id", "name", "logo"],
          },
        ],
      });
    } else {
      deliveryMethod = await DeliveryMethod.findOne({
        where: { slug: id },
        include: [
          {
            model: AIAgent,
            as: "agents",
            attributes: ["id", "name", "logo"],
          },
        ],
      });
    }

    if (!deliveryMethod) {
      return res.status(404).json({ success: false, error: "Delivery method not found" });
    }

    res.json({ success: true, data: deliveryMethod });
  } catch (err) {
    console.error("Error fetching delivery method:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Delivery Method
exports.updateDeliveryMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const deliveryMethod = await DeliveryMethod.findByPk(id);

    if (!deliveryMethod) {
      return res.status(404).json({ success: false, error: "Delivery method not found" });
    }

    if (name && name !== deliveryMethod.name) {
      const slug = req.body.slug || generateSlug(name);
      const existingMethod = await DeliveryMethod.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [{ name }, { slug }],
        },
      });

      if (existingMethod) {
        return res.status(400).json({
          success: false,
          error: "Delivery method with this name or slug already exists",
        });
      }

      if (!req.body.slug) {
        req.body.slug = slug;
      }
    }

    await deliveryMethod.update({
      name,
      slug: req.body.slug || deliveryMethod.slug,
      description,
      isActive,
    });

    const updatedMethod = await DeliveryMethod.findByPk(id, {
      include: [
        {
          model: AIAgent,
          as: "agents",
          attributes: ["id"],
        },
      ],
    });

    res.json({ success: true, data: updatedMethod });
  } catch (err) {
    console.error("Error updating delivery method:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete Delivery Method
exports.deleteDeliveryMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const deliveryMethod = await DeliveryMethod.findByPk(id);

    if (!deliveryMethod) {
      return res.status(404).json({ success: false, error: "Delivery method not found" });
    }

    await deliveryMethod.destroy();

    res.json({ success: true, message: "Delivery method deleted successfully" });
  } catch (err) {
    console.error("Error deleting delivery method:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

