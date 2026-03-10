const db = require("../config/db");
const Brand = db.Brand;
const SubCategory = db.SubCategory;
const Product = db.Product;

/**
 * GET /api/filters/brands-and-subcategories
 * Returns brands and subcategories for filter dropdowns/sidebars.
 * Used by frontends that expect this single endpoint instead of /api/brands + /api/subcategories.
 */
exports.getBrandsAndSubcategories = async (req, res) => {
  try {
    const [brands, subcategories] = await Promise.all([
      Brand.findAll({
        order: [["title", "ASC"]],
        attributes: ["id", "title"],
      }),
      SubCategory.findAll({
        order: [["title", "ASC"]],
        attributes: ["id", "title", "parentId"],
      }),
    ]);

    res.json({
      success: true,
      data: {
        brands: brands.map((b) => ({ id: b.id, title: b.title })),
        subcategories: subcategories.map((s) => ({
          id: s.id,
          title: s.title,
          parentId: s.parentId,
        })),
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
    const productTable = Product.tableName || "products";

    const [categoryCounts, brandCounts, subcategories, brands] = await Promise.all([
      sequelize.query(
        `SELECT "subCategoryId" as id, COUNT(*)::int as "productCount"
         FROM ${productTable}
         WHERE "subCategoryId" IS NOT NULL
         GROUP BY "subCategoryId"`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT "brandId" as id, COUNT(*)::int as "productCount"
         FROM ${productTable}
         WHERE "brandId" IS NOT NULL
         GROUP BY "brandId"`,
        { type: sequelize.QueryTypes.SELECT }
      ),
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
      (categoryCounts || []).map((r) => [r.id, r.productCount])
    );
    const countByBrandId = Object.fromEntries(
      (brandCounts || []).map((r) => [r.id, r.productCount])
    );

    const categories = (subcategories || []).map((s) => ({
      id: s.id,
      title: s.title,
      productCount: countBySubId[s.id] ?? 0,
    }));

    const brandsWithCount = (brands || []).map((b) => ({
      id: b.id,
      title: b.title,
      productCount: countByBrandId[b.id] ?? 0,
    }));

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
