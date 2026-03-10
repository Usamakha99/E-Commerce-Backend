

const db = require('../config/db');
const Category = db.Category;
const SubCategory = db.SubCategory;
const { Op } = require('sequelize');

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const includeSubcategories = (req.query.includeSubcategories || '').toString().toLowerCase() === 'true';
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Number.isNaN(limitRaw) || limitRaw < 1 ? 1000 : Math.min(5000, limitRaw);

    const categories = await Category.findAll({
      limit,
      order: [['title', 'ASC']],
    });

    if (!includeSubcategories) {
      return res.json(categories);
    }

    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length === 0) {
      return res.json(categories.map((c) => ({ ...c.toJSON(), subcategories: [] })));
    }

    const subcategories = await SubCategory.findAll({
      where: { parentId: { [Op.in]: categoryIds } },
      order: [['title', 'ASC']],
    });

    const byParent = {};
    subcategories.forEach((s) => {
      const pid = s.parentId;
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push(s);
    });

    const result = categories.map((c) => {
      const j = typeof c.toJSON === 'function' ? c.toJSON() : c;
      return { ...j, subcategories: byParent[c.id] || [] };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.update(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};