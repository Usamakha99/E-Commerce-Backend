const db = require("../config/db");
const { Op } = require("sequelize");
const ProductTag = db.ProductTag;
const Product = db.Product;

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

exports.createProductTag = async (req, res) => {
  try {
    const { name, description, color, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    // Generate slug if not provided
    const slug = req.body.slug || generateSlug(name);

    // Check if tag with same name or slug already exists
    const existingTag = await ProductTag.findOne({
      where: {
        [Op.or]: [{ name }, { slug }],
      },
    });

    if (existingTag) {
      return res.status(400).json({
        error: "Tag with this name or slug already exists",
      });
    }

    const productTag = await ProductTag.create({
      name,
      slug,
      description,
      color,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(productTag);
  } catch (err) {
    console.error("Error creating product tag:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProductTags = async (req, res) => {
  try {
    const { isActive, search } = req.query;
    const whereClause = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const productTags = await ProductTag.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "title", "sku"],
          through: { attributes: [] }, // Exclude join table attributes
        },
      ],
    });

    res.json(productTags);
  } catch (err) {
    console.error("Error fetching product tags:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProductTag = async (req, res) => {
  try {
    const productTag = await ProductTag.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "title", "sku", "mainImage", "price"],
          through: { attributes: [] },
        },
      ],
    });

    if (!productTag) {
      return res.status(404).json({ error: "Product tag not found" });
    }

    res.json(productTag);
  } catch (err) {
    console.error("Error fetching product tag:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProductTag = async (req, res) => {
  try {
    const productTag = await ProductTag.findByPk(req.params.id);

    if (!productTag) {
      return res.status(404).json({ error: "Product tag not found" });
    }

    const { name, slug, description, color, isActive } = req.body;

    // If name is being updated, check for duplicates
    if (name && name !== productTag.name) {
      const existingTag = await ProductTag.findOne({
        where: {
          [Op.or]: [{ name }, { slug: slug || generateSlug(name) }],
        },
      });

      if (existingTag && existingTag.id !== productTag.id) {
        return res.status(400).json({
          error: "Tag with this name or slug already exists",
        });
      }
    }

    // Update fields
    if (name) productTag.name = name;
    if (slug) productTag.slug = slug;
    else if (name) productTag.slug = generateSlug(name);
    if (description !== undefined) productTag.description = description;
    if (color !== undefined) productTag.color = color;
    if (isActive !== undefined) productTag.isActive = isActive;

    await productTag.save();

    res.json(productTag);
  } catch (err) {
    console.error("Error updating product tag:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProductTag = async (req, res) => {
  try {
    const productTag = await ProductTag.findByPk(req.params.id);

    if (!productTag) {
      return res.status(404).json({ error: "Product tag not found" });
    }

    // Remove all associations with products before deleting
    await productTag.setProducts([]);

    await productTag.destroy();

    res.json({ message: "Product tag deleted successfully" });
  } catch (err) {
    console.error("Error deleting product tag:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add products to a tag
exports.addProductsToTag = async (req, res) => {
  try {
    const { productIds } = req.body;
    const productTag = await ProductTag.findByPk(req.params.id);

    if (!productTag) {
      return res.status(404).json({ error: "Product tag not found" });
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Product IDs array is required" });
    }

    // Verify all products exist
    const products = await Product.findAll({
      where: { id: productIds },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "Some products not found" });
    }

    await productTag.addProducts(products);

    const updatedTag = await ProductTag.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "title", "sku"],
          through: { attributes: [] },
        },
      ],
    });

    res.json(updatedTag);
  } catch (err) {
    console.error("Error adding products to tag:", err);
    res.status(500).json({ error: err.message });
  }
};

// Remove products from a tag
exports.removeProductsFromTag = async (req, res) => {
  try {
    // For DELETE requests, body might be empty, so check query params or body
    const productIds = req.body?.productIds || req.query?.productIds;
    const productTag = await ProductTag.findByPk(req.params.id);

    if (!productTag) {
      return res.status(404).json({ error: "Product tag not found" });
    }

    if (!productIds) {
      return res.status(400).json({ error: "Product IDs are required" });
    }

    const idsArray = Array.isArray(productIds) 
      ? productIds 
      : productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (idsArray.length === 0) {
      return res.status(400).json({ error: "Valid product IDs are required" });
    }

    const products = await Product.findAll({
      where: { id: idsArray },
    });

    await productTag.removeProducts(products);

    const updatedTag = await ProductTag.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "title", "sku"],
          through: { attributes: [] },
        },
      ],
    });

    res.json(updatedTag);
  } catch (err) {
    console.error("Error removing products from tag:", err);
    res.status(500).json({ error: err.message });
  }
};

