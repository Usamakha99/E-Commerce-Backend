const db = require("../config/db");
const { Op } = require("sequelize");
const AICategory = db.AICategory;
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

// Create Category
exports.createAICategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Category name is required" });
    }

    const slug = req.body.slug || generateSlug(name);

    // Check if category with same name or slug already exists
    const existingCategory = await AICategory.findOne({
      where: {
        [Op.or]: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Category with this name or slug already exists",
      });
    }

    const category = await AICategory.create({
      name,
      slug,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("Error creating AI category:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all Categories
exports.getAICategories = async (req, res) => {
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
    const total = await AICategory.count({ where: whereClause });

    const categories = await AICategory.findAll({
      where: whereClause,
      include: [
        {
          model: AIAgent,
          as: "agents",
          attributes: ["id"],
          through: { attributes: [] },
          required: false,
        },
      ],
      order: [["name", "ASC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    // Add count to each category
    const categoriesWithCounts = categories.map((category) => ({
      ...category.toJSON(),
      count: category.agents ? category.agents.length : 0,
    }));

    res.json({
      success: true,
      data: categoriesWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching AI categories:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single Category
exports.getAICategory = async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    let category;
    if (isNumeric) {
      category = await AICategory.findByPk(id, {
        include: [
          {
            model: AIAgent,
            as: "agents",
            attributes: ["id", "name", "logo"],
            through: { attributes: [] },
          },
        ],
      });
    } else {
      category = await AICategory.findOne({
        where: { slug: id },
        include: [
          {
            model: AIAgent,
            as: "agents",
            attributes: ["id", "name", "logo"],
            through: { attributes: [] },
          },
        ],
      });
    }

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    console.error("Error fetching AI category:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Category
exports.updateAICategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await AICategory.findByPk(id);

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    // Check if name/slug already exists (excluding current category)
    if (name && name !== category.name) {
      const slug = req.body.slug || generateSlug(name);
      const existingCategory = await AICategory.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [{ name }, { slug }],
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: "Category with this name or slug already exists",
        });
      }

      if (!req.body.slug) {
        req.body.slug = slug;
      }
    }

    await category.update({
      name,
      slug: req.body.slug || category.slug,
      description,
      isActive,
    });

    const updatedCategory = await AICategory.findByPk(id, {
      include: [
        {
          model: AIAgent,
          as: "agents",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    res.json({ success: true, data: updatedCategory });
  } catch (err) {
    console.error("Error updating AI category:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete Category
exports.deleteAICategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await AICategory.findByPk(id);

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    await category.destroy();

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting AI category:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

