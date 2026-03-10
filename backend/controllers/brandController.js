
const db = require('../config/db');
const Brand = db.Brand;
const Product = db.Product;
const { Op } = require('sequelize');

exports.createBrand = async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/brands
 * Returns brands with id, title, name (alias), and product count (count / productCount / product_count).
 */
exports.getBrands = async (req, res) => {
  try {
    const sequelize = db.sequelize;
    const [brands, countRows] = await Promise.all([
      Brand.findAll({ order: [["title", "ASC"]], attributes: ["id", "title"] }),
      Product.findAll({
        attributes: [
          "brandId",
          [sequelize.fn("COUNT", sequelize.col("Product.id")), "productCount"],
        ],
        where: { brandId: { [Op.ne]: null } },
        group: ["brandId"],
        raw: true,
      }),
    ]);

    const countByBrandId = Object.fromEntries(
      (countRows || []).map((r) => {
        const id = r.brandId ?? r.brand_id;
        const c = Number(r.productCount ?? r.productcount ?? 0);
        return [id, c];
      })
    );

    const list = (brands || []).map((b) => {
      const c = countByBrandId[b.id] ?? 0;
      return {
        id: b.id,
        title: b.title,
        name: b.title,
        count: c,
        productCount: c,
        product_count: c,
      };
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    await brand.update(req.body);
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    await brand.destroy();
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};