/**
 * FTP Products API integration (per API_DOCUMENTATION.html).
 * Works alongside Icecat: FTP provides catalog (mfr_sku, vendor_name, description, upc);
 * Icecat enriches images/description/category when available.
 */
const ftpProductsApiService = require("../services/ftpProductsApiService");
const db = require("../config/db");
const { Op } = require("sequelize");
const axios = require("axios");

const ProductForImport = db.productForImport;
const Product = db.Product;
const Brand = db.Brand;
const Category = db.Category;
const SubCategory = db.SubCategory;
const Image = db.Image;
const Gallery = db.Gallery;
const FtpProductCache = db.FtpProductCache;

const ICECAT_SHOPNAME = process.env.ICECAT_SHOPNAME || "vcloudchoice";
const ICECAT_LANG = process.env.ICECAT_LANG || "en";
const ICECAT_APP_KEY =
  process.env.ICECAT_API_KEY || "HhFakMaKzZsHF3fb6O_VUXzMNoky7Xpf";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeString = (v) => (v == null ? "" : String(v).trim());

const callIcecatAPIWithRetry = async (productCode, brand, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get("https://live.icecat.biz/api/", {
        params: {
          shopname: ICECAT_SHOPNAME,
          lang: ICECAT_LANG,
          Brand: brand,
          ProductCode: productCode,
          app_key: ICECAT_APP_KEY,
        },
        timeout: 20000,
        validateStatus: (status) => status < 500,
      });
      return response;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await delay(1000 * attempt);
    }
  }
};

const pickIcecatMainImageUrl = (imageData) => {
  if (!imageData) return null;
  return (
    imageData.HighPic ||
    imageData.Pic500x500 ||
    imageData.Pic ||
    imageData.LowPic ||
    null
  );
};

const pickIcecatGalleryImageUrl = (img) => {
  if (!img) return null;
  return img.HighPic || img.Pic500x500 || img.Pic || img.LowPic || img.ThumbPic || null;
};

const mapIcecatImages = ({ imageData, galleryData }) => {
  const out = [];
  const seen = new Set();

  const pushRemote = (obj) => {
    const url = obj?.url;
    if (!url) return;
    if (seen.has(url)) return;
    seen.add(url);
    out.push(obj);
  };

  const mainUrl = pickIcecatMainImageUrl(imageData);
  if (mainUrl) {
    pushRemote({
      kind: "remote",
      url: mainUrl,
      thumbUrl: imageData?.ThumbPic || null,
      isMain: true,
      source: "main",
      orderIndex: 0,
    });
  }

  if (Array.isArray(galleryData)) {
    galleryData.forEach((img, idx) => {
      const url = pickIcecatGalleryImageUrl(img);
      pushRemote({
        kind: "remote",
        url,
        thumbUrl: img?.ThumbPic || null,
        isMain: img?.IsMain === "Y",
        source: "gallery",
        orderIndex: idx,
      });
    });
  }

  return out;
};

const extractIcecatCategory = (generalInfo) => {
  const raw = generalInfo?.Category;
  const cat = Array.isArray(raw) ? raw[0] : raw;
  const name = cat?.Name?.Value || cat?.Name || cat?.CategoryName || null;
  const parentName =
    cat?.ParentCategory?.Name?.Value ||
    cat?.ParentCategory?.Name ||
    cat?.ParentCategoryName ||
    null;

  if (parentName && name) return { category: parentName, subCategory: name };
  if (name) return { category: name, subCategory: null };
  return { category: null, subCategory: null };
};

const buildBrandCandidates = (rawBrand, { detail = false } = {}) => {
  const b = normalizeString(rawBrand);
  if (!b) return [];

  const set = new Set();
  set.add(b);

  const cleaned = b.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned) set.add(cleaned);

  const withoutSuffix = cleaned
    .replace(/\b(inc|inc\.|ltd|ltd\.|limited|corp|corporation|co|co\.|company)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (withoutSuffix) set.add(withoutSuffix);

  const max = detail ? 5 : 2;
  return Array.from(set).filter(Boolean).slice(0, max);
};

const buildProductCodeCandidates = (ftp, { detail = false } = {}) => {
  const candidates = [];
  const push = (v) => {
    const s = normalizeString(v);
    if (!s) return;
    candidates.push(s);
  };

  push(ftp?.mfr_sku);
  if (detail) {
    push(ftp?.internal_sku);
    push(ftp?.upc);
    if (ftp?.mfr_sku) push(String(ftp.mfr_sku).replace(/\s+/g, ""));
    if (ftp?.upc) push(String(ftp.upc).replace(/\s+/g, ""));
  }

  const seen = new Set();
  return candidates.filter((c) => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });
};

const callIcecatFlexible = async ({ ftp, brand, detail }) => {
  const brandCandidates = buildBrandCandidates(brand, { detail });
  const codeCandidates = buildProductCodeCandidates(ftp, { detail });

  const attempts = [];
  for (const b of brandCandidates) {
    for (const code of codeCandidates) attempts.push({ brand: b, productCode: code });
  }

  for (const a of attempts) {
    const resp = await callIcecatAPIWithRetry(a.productCode, a.brand, 2);
    if (resp.status === 404) continue;
    return { response: resp, attempts, used: a };
  }

  return {
    response: { status: 404 },
    attempts,
    used: attempts[0] || { brand, productCode: ftp?.mfr_sku },
  };
};

const productHasStoredImages = async (product) => {
  if (!product) return false;
  if (product.mainImage && String(product.mainImage).trim() !== "") return true;
  const productId = product.id;
  if (!productId) return false;

  const [imageCount, galleryCount] = await Promise.all([
    Image.count({ where: { productId } }),
    Gallery.count({ where: { productId } }),
  ]);
  return imageCount > 0 || galleryCount > 0;
};

const updateCacheCategory = async ({ ftp, categoryTitle, subCategoryTitle, source }) => {
  try {
    if (!FtpProductCache) return;
    const ftpId = ftp?.id != null ? Number(ftp.id) : null;
    const tableName = ftp?.table_name || null;
    if (!ftpId || !tableName) return;

    await FtpProductCache.update(
      {
        categoryTitle: categoryTitle || null,
        subCategoryTitle: subCategoryTitle || null,
        categorySource: source || null,
        lastSyncedAt: new Date(),
      },
      { where: { ftpId, tableName } }
    );
  } catch (_e) {
    // don't fail enrich if cache update fails
  }
};

// Core enrich logic that returns a merged payload (used by single + batch).
const enrichFtpProductCore = async (body, { detail = false } = {}) => {
  let ftp = body.ftp || null;
  if (!ftp && body.ftpProductId) {
    ftp = await ftpProductsApiService.getProductById(
      Number(body.ftpProductId),
      body.table_name || body.tableName || null
    );
  }

  if (!ftp) {
    ftp = {
      id: body.id || null,
      internal_sku: body.internal_sku || body.internalSku || null,
      mfr_sku: body.mfr_sku || body.sku || null,
      vendor_name: body.vendor_name || body.brand || null,
      description: body.description || null,
      upc: body.upc || null,
      stock: body.stock || null,
      distributor: body.distributor || null,
      table_name: body.table_name || null,
    };
  }

  const sku = normalizeString(ftp.mfr_sku || body.sku || body.mfr_sku);
  const brand = normalizeString(ftp.vendor_name || body.brand || body.vendor_name);
  if (!sku || !brand) {
    return {
      ok: false,
      status: 400,
      payload: {
        success: false,
        error: "SKU (mfr_sku) and Brand (vendor_name) are required to enrich",
        received: { sku, brand },
      },
    };
  }

  // DB cache check (fast path)
  let dbProduct = null;
  const brandRecord =
    (await Brand.findOne({ where: { title: { [Op.iLike]: brand } } })) ||
    (await Brand.findOne({ where: { title: brand } }));

  if (brandRecord) {
    dbProduct = await Product.findOne({ where: { sku, brandId: brandRecord.id } });
  }

  if (dbProduct) {
    const hasImages = await productHasStoredImages(dbProduct);
    const hasDescription =
      (dbProduct.shortDescp && String(dbProduct.shortDescp).trim() !== "") ||
      (dbProduct.longDescp && String(dbProduct.longDescp).trim() !== "");

    if (hasImages && hasDescription) {
      let images = undefined;
      let category = undefined;
      let subCategory = undefined;

      if (detail) {
        const productId = dbProduct.id;
        const galleries = await Gallery.findAll({
          where: { productId },
          order: [
            ["isMain", "DESC"],
            ["orderIndex", "ASC"],
            ["id", "ASC"],
          ],
        });

        const seen = new Set();
        images = [];
        const pushLocal = (filename, extra = {}) => {
          const f = filename ? String(filename).trim() : "";
          if (!f) return;
          if (seen.has(f)) return;
          seen.add(f);
          images.push({ kind: "local", filename: f, ...extra });
        };

        if (dbProduct.mainImage) pushLocal(dbProduct.mainImage, { isMain: true, source: "main", orderIndex: 0 });
        for (const g of galleries) {
          pushLocal(g.url, {
            isMain: Boolean(g.isMain),
            source: "gallery",
            orderIndex: Number.isFinite(g.orderIndex) ? g.orderIndex : 0,
          });
        }

        try {
          if (Category && dbProduct.categoryId) {
            const cat = await Category.findByPk(dbProduct.categoryId);
            category = cat ? { id: cat.id, title: cat.title } : null;
          } else category = null;
        } catch (_e) {
          category = null;
        }

        try {
          if (SubCategory && dbProduct.subCategoryId) {
            const sub = await SubCategory.findByPk(dbProduct.subCategoryId);
            subCategory = sub ? { id: sub.id, title: sub.title } : null;
          } else subCategory = null;
        } catch (_e) {
          subCategory = null;
        }

        await updateCacheCategory({
          ftp,
          categoryTitle: category?.title || null,
          subCategoryTitle: subCategory?.title || null,
          source: "db",
        });
      }

      return {
        ok: true,
        status: 200,
        payload: {
          success: true,
          source: "db_cache",
          ftp,
          icecat: null,
          merged: {
            sku,
            brand,
            upc: ftp.upc || dbProduct.upcCode || null,
            title: dbProduct.title || null,
            shortDesc: detail ? (dbProduct.shortDescp || null) : undefined,
            longDesc: detail ? (dbProduct.longDescp || null) : undefined,
            description: dbProduct.longDescp || dbProduct.shortDescp || ftp.description || null,
            mainImage: dbProduct.mainImage || null,
            images,
            category,
            subCategory,
            productId: dbProduct.id,
          },
          cache: {
            alreadyCached: true,
            dbProductId: dbProduct.id,
            enrichEndpoint: `/api/products/${dbProduct.id}/enrich-from-icecat`,
          },
        },
      };
    }
  }

  // Icecat call (only when not fully cached)
  const icecatLookup = detail
    ? await callIcecatFlexible({ ftp, brand, detail: true })
    : {
        response: await callIcecatAPIWithRetry(sku, brand, 2),
        attempts: [{ brand, productCode: sku }],
        used: { brand, productCode: sku },
      };

  const icecatResponse = icecatLookup.response;

  if (icecatResponse.status === 404) {
    return {
      ok: true,
      status: 200,
      payload: {
        success: true,
        source: "ftp_only",
        ftp,
        icecat: {
          found: false,
          tried: icecatLookup.used || { brand, productCode: sku },
          attempts: detail ? icecatLookup.attempts : undefined,
        },
        merged: {
          sku,
          brand,
          upc: ftp.upc || null,
          title: ftp.description ? String(ftp.description).slice(0, 80) : `${sku} - ${brand}`,
          shortDesc: detail ? (ftp.description ? String(ftp.description).slice(0, 160) : null) : undefined,
          longDesc: detail ? (ftp.description || null) : undefined,
          description: ftp.description || null,
          mainImageUrl: null,
          images: detail ? [] : undefined,
          category: detail ? null : undefined,
          subCategory: detail ? null : undefined,
        },
        cache: {
          alreadyCached: false,
          dbProductId: dbProduct?.id || null,
          message: "Not found in Icecat (404)",
        },
      },
    };
  }

  if (!icecatResponse.data?.data || icecatResponse.data.Error) {
    return {
      ok: false,
      status: 502,
      payload: {
        success: false,
        error:
          icecatResponse.data?.Error?.description ||
          "Invalid response from Icecat API",
      },
    };
  }

  const icecatData = icecatResponse.data;
  const generalInfo = icecatData.data?.GeneralInfo;
  const imageData = icecatData.data?.Image;
  const galleryData = icecatData.data?.Gallery;
  const mainImageUrl = pickIcecatMainImageUrl(imageData);
  const longDesc = generalInfo?.Description?.LongDesc || null;
  const shortTitle = generalInfo?.Title || null;
  const productName = generalInfo?.ProductName || null;
  const icecatUpc = generalInfo?.UPC || null;
  const shortDesc = shortTitle || productName || null;
  const images = detail ? mapIcecatImages({ imageData, galleryData }) : undefined;
  const icecatCategory = extractIcecatCategory(generalInfo);

  await updateCacheCategory({
    ftp,
    categoryTitle: icecatCategory.category,
    subCategoryTitle: icecatCategory.subCategory,
    source: "icecat",
  });

  return {
    ok: true,
    status: 200,
    payload: {
      success: true,
      source: "icecat_live",
      ftp,
      icecat: {
        found: true,
        title: productName || shortTitle,
        shortDesc: detail ? shortDesc : undefined,
        longDesc: detail ? longDesc : undefined,
        upc: icecatUpc,
        mainImageUrl,
        images,
        category: icecatCategory.category || undefined,
        subCategory: icecatCategory.subCategory || undefined,
      },
      merged: {
        sku,
        brand,
        upc: ftp.upc || icecatUpc || null,
        title: productName || shortTitle || `${sku} - ${brand}`,
        shortDesc: detail ? shortDesc : undefined,
        longDesc: detail ? longDesc : undefined,
        description: longDesc || ftp.description || shortTitle || null,
        mainImageUrl,
        images,
        category: icecatCategory.category ? { title: icecatCategory.category } : null,
        subCategory: icecatCategory.subCategory ? { title: icecatCategory.subCategory } : null,
        productId: dbProduct?.id || null,
      },
      cache: {
        alreadyCached: false,
        dbProductId: dbProduct?.id || null,
        enrichEndpoint: dbProduct?.id ? `/api/products/${dbProduct.id}/enrich-from-icecat` : null,
        note:
          "This endpoint returns Icecat URLs for UI. To save into DB, import/enrich the product in the main catalog.",
      },
    },
  };
};

// =====================
// FTP API PROXY ROUTES
// =====================

exports.getFtpProducts = async (req, res) => {
  try {
    const result = await ftpProductsApiService.getProducts({
      page: req.query.page,
      per_page: req.query.per_page,
      search: req.query.search,
      search_field: req.query.search_field,
      search_value: req.query.search_value,
      sort_by: req.query.sort_by,
      sort_direction: req.query.sort_direction,
      distributor: req.query.distributor,
      include_icecat: req.query.include_icecat,
    });
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
      filters: result.filters,
    });
  } catch (err) {
    console.error("getFtpProducts error:", err.message);
    res.status(err.response?.status === 401 ? 401 : 500).json({
      success: false,
      error: err.message || "Failed to fetch FTP products",
    });
  }
};

exports.getFtpProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "Invalid product ID" });
    const product = await ftpProductsApiService.getProductById(
      id,
      req.query.table_name
    );
    if (!product) return res.status(404).json({ error: "FTP product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error("getFtpProductById error:", err.message);
    res.status(err.response?.status === 401 ? 401 : 500).json({
      success: false,
      error: err.message || "Failed to fetch FTP product",
    });
  }
};

// =====================
// SYNC → product_for_import
// =====================
exports.syncFromFtp = async (req, res) => {
  try {
    const { page = 1, per_page = 50, distributor, upsert = true } = req.body || {};
    const result = await ftpProductsApiService.getProducts({
      page: Number(page) || 1,
      per_page: Math.min(Number(per_page) || 50, 200),
      distributor: distributor || undefined,
      include_icecat: false,
    });

    const items = result.data || [];
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of items) {
      const sku = normalizeString(item?.mfr_sku);
      const brand = normalizeString(item?.vendor_name);
      if (!sku || !brand) {
        skipped++;
        continue;
      }

      const payload = {
        sku,
        brand,
        upcCode: item?.upc ? String(item.upc) : null,
        distributor: item?.distributor ? String(item.distributor) : null,
        source: "external_api",
        lastUpdated: new Date(),
        status: "inactive",
      };

      const existing = await ProductForImport.findOne({ where: { sku } });
      if (existing) {
        if (upsert) {
          await existing.update(payload);
          updated++;
        } else skipped++;
      } else {
        await ProductForImport.create({ ...payload, createdAt: new Date() });
        created++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced FTP products: ${created} created, ${updated} updated, ${skipped} skipped`,
      synced: created + updated,
      created,
      updated,
      skipped,
      meta: result.meta,
    });
  } catch (err) {
    console.error("syncFromFtp error:", err.message);
    res.status(err.response?.status === 401 ? 401 : 500).json({
      success: false,
      error: err.message || "Failed to sync from FTP API",
    });
  }
};

// =====================
// ENRICH (ON-DEMAND)
// =====================
exports.enrichFtpProduct = async (req, res) => {
  try {
    const detail = Boolean(req.body?.detail);
    const core = await enrichFtpProductCore(req.body || {}, { detail });
    return res.status(core.status).json(core.payload);
  } catch (err) {
    console.error("enrichFtpProduct error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to enrich FTP product with Icecat",
    });
  }
};

exports.enrichFtpProductsBatch = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ success: false, error: "Body must include items: []" });
    }

    const concurrency = Math.min(Math.max(parseInt(req.body?.concurrency, 10) || 3, 1), 5);
    const results = [];

    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          try {
            const core = await enrichFtpProductCore(item || {}, { detail: false });
            return { ok: core.ok, status: core.status, ...core.payload };
          } catch (e) {
            return { ok: false, status: 500, success: false, error: e.message, received: item || null };
          }
        })
      );
      results.push(...batchResults);
      await delay(200);
    }

    return res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    console.error("enrichFtpProductsBatch error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to enrich FTP products batch",
    });
  }
};

// =========================
// FTP → DB CACHE ENDPOINTS
// =========================

const mapFtpToCacheRow = (item) => {
  const toNum = (v) => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const toInt = (v) => {
    if (v == null || v === "") return null;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  };
  const toDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  return {
    ftpId: item?.id != null ? toInt(item.id) : null,
    internalSku: item?.internal_sku != null ? String(item.internal_sku) : null,
    mfrSku: item?.mfr_sku != null ? String(item.mfr_sku) : null,
    vendorName: item?.vendor_name != null ? String(item.vendor_name) : null,
    description: item?.description != null ? String(item.description) : null,
    msrp: toNum(item?.msrp),
    cogs: toNum(item?.cogs),
    weight: toNum(item?.weight),
    dimensions:
      item?.dimensions != null
        ? String(item.dimensions)
        : [item?.length, item?.width, item?.height].some((v) => v != null && v !== "")
          ? [item?.length, item?.width, item?.height].filter((v) => v != null && v !== "").join(" x ")
          : item?.dimension != null
            ? String(item.dimension)
            : null,
    upc: item?.upc != null ? String(item.upc) : null,
    stock: item?.stock != null ? toInt(item.stock) : null,
    distributor: item?.distributor != null ? String(item.distributor) : null,
    tableName: item?.table_name != null ? String(item.table_name) : null,
    ftpCreatedAt: toDate(item?.created_at),
    ftpUpdatedAt: toDate(item?.updated_at),
    lastSyncedAt: new Date(),
  };
};

const safeSort = (sortBy, sortDirection) => {
  const allowed = {
    id: "id",
    ftpId: "ftpId",
    internal_sku: "internalSku",
    mfr_sku: "mfrSku",
    vendor_name: "vendorName",
    upc: "upc",
    msrp: "msrp",
    stock: "stock",
    distributor: "distributor",
    table_name: "tableName",
    ftp_updated_at: "ftpUpdatedAt",
    last_synced_at: "lastSyncedAt",
  };
  const col = allowed[String(sortBy || "").trim()] || "ftpUpdatedAt";
  const dir = String(sortDirection || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  return [col, dir];
};

/** GET /cache/count – total number of rows in FTP catalog cache (no pagination, fast). */
exports.getCachedFtpProductsCount = async (req, res) => {
  try {
    if (!FtpProductCache) {
      return res.status(500).json({
        success: false,
        error: "FtpProductCache model not loaded. Restart backend after adding the model.",
      });
    }
    const where = {};
    const search = (req.query.search || "").trim();
    const distributor = (req.query.distributor || "").trim();
    if (distributor) where.distributor = { [Op.iLike]: distributor };
    if (search) {
      where[Op.or] = [
        { internalSku: { [Op.iLike]: `%${search}%` } },
        { mfrSku: { [Op.iLike]: `%${search}%` } },
        { vendorName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const total = await FtpProductCache.count({ where });
    return res.status(200).json({ success: true, total });
  } catch (err) {
    console.error("getCachedFtpProductsCount error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to get FTP catalog count",
    });
  }
};

exports.getCachedFtpProducts = async (req, res) => {
  try {
    if (!FtpProductCache) {
      return res.status(500).json({
        success: false,
        error: "FtpProductCache model not loaded. Restart backend after adding the model.",
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.per_page, 10) || 50, 1), 200);
    const search = (req.query.search || "").trim();
    const distributor = (req.query.distributor || "").trim();

    const where = {};
    if (distributor) where.distributor = { [Op.iLike]: distributor };
    if (search) {
      where[Op.or] = [
        { internalSku: { [Op.iLike]: `%${search}%` } },
        { mfrSku: { [Op.iLike]: `%${search}%` } },
        { vendorName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { upc: { [Op.iLike]: `%${search}%` } },
        { distributor: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const [orderCol, orderDir] = safeSort(req.query.sort_by, req.query.sort_direction);
    const offset = (page - 1) * perPage;

    const { count, rows } = await FtpProductCache.findAndCountAll({
      where,
      limit: perPage,
      offset,
      order: [[orderCol, orderDir]],
    });

    const total = typeof count === "number" ? count : count?.length || 0;
    const lastPage = Math.max(Math.ceil(total / perPage), 1);
    const from = total === 0 ? 0 : offset + 1;
    const to = Math.min(offset + rows.length, total);

    return res.status(200).json({
      success: true,
      data: rows.map((r) => ({
        id: r.ftpId || r.id,
        internal_sku: r.internalSku,
        mfr_sku: r.mfrSku,
        vendor_name: r.vendorName,
        brand: r.vendorName, // compatibility for other frontends
        description: r.description,
        msrp: r.msrp,
        cogs: r.cogs,
        weight: r.weight,
        dimensions: r.dimensions || null,
        upc: r.upc,
        stock: r.stock,
        distributor: r.distributor,
        table_name: r.tableName,
        category: r.categoryTitle || null,
        sub_category: r.subCategoryTitle || null,
        category_source: r.categorySource || null,
        created_at: r.ftpCreatedAt,
        updated_at: r.ftpUpdatedAt,
        last_synced_at: r.lastSyncedAt,
      })),
      meta: {
        current_page: page,
        per_page: perPage,
        total,
        last_page: lastPage,
        from,
        to,
      },
      filters: {
        search: search || null,
        distributor: distributor || null,
        sort_by: req.query.sort_by || "ftp_updated_at",
        sort_direction: req.query.sort_direction || "desc",
        source: "db_cache",
      },
    });
  } catch (err) {
    console.error("getCachedFtpProducts error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch cached FTP products",
    });
  }
};

exports.syncFtpCachePage = async (req, res) => {
  try {
    if (!FtpProductCache) {
      return res.status(500).json({
        success: false,
        error: "FtpProductCache model not loaded. Restart backend after adding the model.",
      });
    }

    const page = Math.max(parseInt(req.body?.page, 10) || 1, 1);
    const per_page = Math.min(Math.max(parseInt(req.body?.per_page, 10) || 200, 1), 200);
    const distributor = req.body?.distributor || undefined;

    const result = await ftpProductsApiService.getProducts({
      page,
      per_page,
      distributor,
      include_icecat: false,
    });

    const items = result.data || [];
    const rows = items.map(mapFtpToCacheRow);

    // IMPORTANT: do NOT update categoryTitle/subCategoryTitle/categorySource here
    // Those are filled by Icecat/DB enrich later and should persist.
    const updatable = [
      "internalSku",
      "mfrSku",
      "vendorName",
      "description",
      "msrp",
      "cogs",
      "weight",
      "dimensions",
      "upc",
      "stock",
      "distributor",
      "tableName",
      "ftpCreatedAt",
      "ftpUpdatedAt",
      "lastSyncedAt",
    ];

    let upserted = 0;
    try {
      await FtpProductCache.bulkCreate(rows, {
        updateOnDuplicate: updatable,
        conflictAttributes: ["ftpId", "tableName"],
      });
      upserted = rows.length;
    } catch (_e) {
      for (const r of rows) {
        const where = { ftpId: r.ftpId, tableName: r.tableName };
        const [record, created] = await FtpProductCache.findOrCreate({
          where,
          defaults: r,
        });
        if (!created) {
          const updatePayload = {};
          for (const k of updatable) updatePayload[k] = r[k];
          await record.update(updatePayload);
        }
        upserted++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Synced FTP cache page ${page} (${upserted} items)`,
      page,
      per_page,
      upserted,
      meta: result.meta || null,
    });
  } catch (err) {
    console.error("syncFtpCachePage error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to sync FTP cache page",
    });
  }
};

exports.syncFtpCacheAll = async (req, res) => {
  try {
    if (!FtpProductCache) {
      return res.status(500).json({
        success: false,
        error: "FtpProductCache model not loaded. Restart backend after adding the model.",
      });
    }

    const start = Date.now();
    const per_page = Math.min(Math.max(parseInt(req.body?.per_page, 10) || 200, 1), 200);
    const distributor = req.body?.distributor || undefined;
    const maxPages = Math.min(Math.max(parseInt(req.body?.max_pages, 10) || 0, 0), 2000);

    let page = 1;
    let lastPage = null;
    let totalUpserted = 0;
    let totalFetched = 0;

    while (true) {
      const result = await ftpProductsApiService.getProducts({
        page,
        per_page,
        distributor,
        include_icecat: false,
      });

      const items = result.data || [];
      totalFetched += items.length;
      if (items.length === 0) break;

      const rows = items.map(mapFtpToCacheRow);
      const updatable = [
        "internalSku",
        "mfrSku",
        "vendorName",
        "description",
        "msrp",
        "cogs",
        "weight",
        "dimensions",
        "upc",
        "stock",
        "distributor",
        "tableName",
        "ftpCreatedAt",
        "ftpUpdatedAt",
        "lastSyncedAt",
      ];

      try {
        await FtpProductCache.bulkCreate(rows, {
          updateOnDuplicate: updatable,
          conflictAttributes: ["ftpId", "tableName"],
        });
        totalUpserted += rows.length;
      } catch (_e) {
        for (const r of rows) {
          const where = { ftpId: r.ftpId, tableName: r.tableName };
          const [record, created] = await FtpProductCache.findOrCreate({
            where,
            defaults: r,
          });
          if (!created) {
            const updatePayload = {};
            for (const k of updatable) updatePayload[k] = r[k];
            await record.update(updatePayload);
          }
          totalUpserted++;
        }
      }

      lastPage = result.meta?.last_page ? Number(result.meta.last_page) : null;
      const shouldStop =
        (lastPage != null && page >= lastPage) || (maxPages > 0 && page >= maxPages);
      if (shouldStop) break;

      page += 1;
      await delay(150);
    }

    return res.status(200).json({
      success: true,
      message: "FTP cache sync completed",
      distributor: distributor || null,
      per_page,
      pagesProcessed: page,
      lastPage,
      fetched: totalFetched,
      upserted: totalUpserted,
      elapsedMs: Date.now() - start,
    });
  } catch (err) {
    console.error("syncFtpCacheAll error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to sync FTP cache (all pages)",
    });
  }
};

