const db = require("../config/db");
const { Op } = require("sequelize");
const Publisher = db.Publisher;
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

// Create Publisher
exports.createPublisher = async (req, res) => {
  try {
    const { name, description, logo, website, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Publisher name is required" });
    }

    const slug = req.body.slug || generateSlug(name);

    const existingPublisher = await Publisher.findOne({
      where: {
        [Op.or]: [{ name }, { slug }],
      },
    });

    if (existingPublisher) {
      return res.status(400).json({
        success: false,
        error: "Publisher with this name or slug already exists",
      });
    }

    const publisher = await Publisher.create({
      name,
      slug,
      description,
      logo,
      website,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: publisher });
  } catch (err) {
    console.error("Error creating publisher:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all Publishers
exports.getPublishers = async (req, res) => {
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
    const total = await Publisher.count({ where: whereClause });

    const publishers = await Publisher.findAll({
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

    const publishersWithCounts = publishers.map((publisher) => ({
      ...publisher.toJSON(),
      count: publisher.agents ? publisher.agents.length : 0,
    }));

    res.json({
      success: true,
      data: publishersWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching publishers:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single Publisher
exports.getPublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    let publisher;
    if (isNumeric) {
      publisher = await Publisher.findByPk(id, {
        include: [
          {
            model: AIAgent,
            as: "agents",
            attributes: ["id", "name", "logo"],
          },
        ],
      });
    } else {
      publisher = await Publisher.findOne({
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

    if (!publisher) {
      return res.status(404).json({ success: false, error: "Publisher not found" });
    }

    res.json({ success: true, data: publisher });
  } catch (err) {
    console.error("Error fetching publisher:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Publisher
exports.updatePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logo, website, isActive } = req.body;

    const publisher = await Publisher.findByPk(id);

    if (!publisher) {
      return res.status(404).json({ success: false, error: "Publisher not found" });
    }

    if (name && name !== publisher.name) {
      const slug = req.body.slug || generateSlug(name);
      const existingPublisher = await Publisher.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [{ name }, { slug }],
        },
      });

      if (existingPublisher) {
        return res.status(400).json({
          success: false,
          error: "Publisher with this name or slug already exists",
        });
      }

      if (!req.body.slug) {
        req.body.slug = slug;
      }
    }

    await publisher.update({
      name,
      slug: req.body.slug || publisher.slug,
      description,
      logo,
      website,
      isActive,
    });

    const updatedPublisher = await Publisher.findByPk(id, {
      include: [
        {
          model: AIAgent,
          as: "agents",
          attributes: ["id"],
        },
      ],
    });

    res.json({ success: true, data: updatedPublisher });
  } catch (err) {
    console.error("Error updating publisher:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete Publisher
exports.deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;

    const publisher = await Publisher.findByPk(id);

    if (!publisher) {
      return res.status(404).json({ success: false, error: "Publisher not found" });
    }

    await publisher.destroy();

    res.json({ success: true, message: "Publisher deleted successfully" });
  } catch (err) {
    console.error("Error deleting publisher:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

