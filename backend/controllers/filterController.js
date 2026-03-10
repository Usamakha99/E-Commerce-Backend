const db = require("../config/db");
const Brand = db.Brand;
const SubCategory = db.SubCategory;
const Product = db.Product;
const { Op } = require("sequelize");

/**
 * GET /api/filters/brands-and-subcategories
 * Returns brands and subcategories with product counts for filter dropdowns/sidebars.
 * Each item includes productCount (and count, product_count for compatibility).
 */
exports.getBrandsAndSubcategories = async (req, res) => {
  try {
    const sequelize = db.sequelize;
    const [brandCounts, subCatCounts, brands, subcategories] = await Promise.all([
      Product.findAll({
        attributes: [
          "brandId",
          [sequelize.fn("COUNT", sequelize.col("Product.id")), "productCount"],
        ],
        where: { brandId: { [Op.ne]: null } },
        group: ["brandId"],
        raw: true,
      }),
      Product.findAll({
        attributes: [
          "subCategoryId",
          [sequelize.fn("COUNT", sequelize.col("Product.id")), "productCount"],
        ],
        where: { subCategoryId: { [Op.ne]: null } },
        group: ["subCategoryId"],
        raw: true,
      }),
      Brand.findAll({
        order: [["title", "ASC"]],
        attributes: ["id", "title"],
      }),
      SubCategory.findAll({
        order: [["title", "ASC"]],
        attributes: ["id", "title", "parentId"],
      }),
    ]);

    const countByBrandId = Object.fromEntries(
      (brandCounts || []).map((r) => {
        const id = r.brandId ?? r.brand_id;
        const count = Number(r.productCount ?? r.productcount ?? 0);
        return [id, count];
      })
    );
    const countBySubId = Object.fromEntries(
      (subCatCounts || []).map((r) => {
        const id = r.subCategoryId ?? r.sub_category_id;
        const count = Number(r.productCount ?? r.productcount ?? 0);
        return [id, count];
      })
    );

    const brandsWithCount = (brands || []).map((b) => {
      const c = countByBrandId[b.id] ?? 0;
      return {
        id: b.id,
        title: b.title,
        productCount: c,
        count: c,
        product_count: c,
      };
    });
    const subcategoriesWithCount = (subcategories || []).map((s) => {
      const c = countBySubId[s.id] ?? 0;
      return {
        id: s.id,
        title: s.title,
        parentId: s.parentId,
        productCount: c,
        count: c,
        product_count: c,
      };
    });

    res.json({
      success: true,
      data: {
        brands: brandsWithCount,
        subcategories: subcategoriesWithCount,
      },
    });
  } catch (err) {
    console.error("getBrandsAndSubcategories error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      data: { brands: [], subcategories: [] },
    });
  }
};

/**
 * GET /api/filters/sidebar
 * Returns product categories (subcategories) and brands with product counts for storefront sidebar.
 * Response: { success, data: { categories: [{ id, title, productCount }], brands: [{ id, title, productCount }] } }
 */
exports.getSidebarFilters = async (req, res) => {
  try {
    const sequelize = db.sequelize;

    // Use Sequelize model so column names match the DB (camelCase or snake_case)
    const [categoryCounts, brandCounts, subcategories, brands] = await Promise.all([
      Product.findAll({
        attributes: [
          "subCategoryId",
          [sequelize.fn("COUNT", sequelize.col("Product.id")), "productCount"],
        ],
        where: { subCategoryId: { [Op.ne]: null } },
        group: ["subCategoryId"],
        raw: true,
      }),
      Product.findAll({
        attributes: [
          "brandId",
          [sequelize.fn("COUNT", sequelize.col("Product.id")), "productCount"],
        ],
        where: { brandId: { [Op.ne]: null } },
        group: ["brandId"],
        raw: true,
      }),
      SubCategory.findAll({
        order: [["title", "ASC"]],
        attributes: ["id", "title"],
      }),
      Brand.findAll({
        order: [["title", "ASC"]],
        attributes: ["id", "title"],
      }),
    ]);

    const countBySubId = Object.fromEntries(
      (categoryCounts || []).map((r) => {
        const id = r.subCategoryId ?? r.sub_category_id;
        const count = Number(r.productCount ?? r.productcount ?? 0);
        return [id, count];
      })
    );
    const countByBrandId = Object.fromEntries(
      (brandCounts || []).map((r) => {
        const id = r.brandId ?? r.brand_id;
        const count = Number(r.productCount ?? r.productcount ?? 0);
        return [id, count];
      })
    );

    const categories = (subcategories || []).map((s) => {
      const c = countBySubId[s.id] ?? 0;
      return {
        id: s.id,
        title: s.title,
        productCount: c,
        count: c,
        product_count: c,
      };
    });

    const brandsWithCount = (brands || []).map((b) => {
      const c = countByBrandId[b.id] ?? 0;
      return {
        id: b.id,
        title: b.title,
        productCount: c,
        count: c,
        product_count: c,
      };
    });

    res.json({
      success: true,
      data: {
        categories,
        brands: brandsWithCount,
      },
    });
  } catch (err) {
    console.error("getSidebarFilters error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      data: { categories: [], brands: [] },
    });
  }
};
