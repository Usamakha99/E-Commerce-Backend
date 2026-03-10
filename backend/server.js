// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const axios = require("axios");
// Load .env from backend directory so credentials are found even when cwd is project root or Docker
require("dotenv").config({ path: path.join(__dirname, ".env") });

// ✅ Import from config/db.js
const db = require("./config/db");

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// --- Auto-register all routes in /routes ---
const routesPath = path.join(__dirname, "routes");

// Routes that are manually registered (exclude from auto-registration)
const manuallyRegisteredRoutes = [
  "cartRoutes.js",
  "orderRoutes.js",
  "analyticsRoutes.js",
  "userRoutes.js",
  "productInquiryRoutes.js", // Manually registered with correct plural
  "aiAgentRoutes.js", // Manually registered
  "aiCategoryRoutes.js", // Manually registered
  "deliveryMethodRoutes.js", // Manually registered
  "publisherRoutes.js", // Manually registered
];

if (fs.existsSync(routesPath)) {
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith("Routes.js") && !manuallyRegisteredRoutes.includes(file)) {
      try {
        console.log(`🔍 Loading route: ${file}`);
        const route = require(path.join(routesPath, file));
        const baseName = file.replace("Routes.js", "");
        let routeName = baseName.toLowerCase();

        if (!routeName.endsWith("s")) {
          routeName += "s";
        }

        // Test if the router is valid before using it
        if (route && typeof route === "function") {
          app.use(`/api/${routeName}`, route);
          console.log(`✅ Route registered: /api/${routeName}`);
        } else {
          console.log(`⚠️  Skipping invalid route: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error loading route ${file}:`, error.message);
        // Don't crash the server, just skip the problematic route
      }
    }
  });
} else {
  console.warn("⚠️ Routes directory not found:", routesPath);
}

// --- MANUALLY REGISTER NEW ROUTES ---
try {
  // Register cart routes
  const cartRoutes = require("./routes/cartRoutes");
  app.use("/api/carts", cartRoutes);
  console.log("✅ Cart routes registered manually");
} catch (error) {
  console.error("❌ Error loading cart routes:", error.message);
}

try {
  // Register order routes
  const orderRoutes = require("./routes/orderRoutes");
  app.use("/api/orders", orderRoutes);
  console.log("✅ Order routes registered manually");
} catch (error) {
  console.error("❌ Error loading order routes:", error.message);
}

// Add this to your server.js file in the routes section

try {
  // Register analytics routes
  const analyticsRoutes = require("./routes/analyticsRoutes");
  app.use("/api/analytics", analyticsRoutes);
  console.log("✅ Analytics routes registered manually");
} catch (error) {
  console.error("❌ Error loading analytics routes:", error.message);
}

// ============================================
// 🔥 USER/AUTH ROUTES - ADD THIS CODE 🔥
// ============================================
try {
  const userRoutes = require("./routes/userRoutes");
  app.use("/api/users", userRoutes);
  console.log("✅✅✅ USER ROUTES REGISTERED ✅✅✅");
  console.log("   📍 /api/users/register");
  console.log("   📍 /api/users/login");
  console.log("   📍 /api/users/verify-email");
  console.log("   📍 /api/users/resend-verification");
} catch (error) {
  console.error("❌❌❌ USER ROUTES FAILED:", error.message);
}
// ============================================
// 🔥 END USER ROUTES 🔥
// ============================================

// ============================================
// 🔥 PRODUCT INQUIRY ROUTES 🔥
// ============================================
try {
  const productInquiryRoutes = require("./routes/productInquiryRoutes");
  app.use("/api/productinquiries", productInquiryRoutes);
  console.log("✅✅✅ PRODUCT INQUIRY ROUTES REGISTERED ✅✅✅");
  console.log("   📍 POST /api/productinquiries");
  console.log("   📍 GET /api/productinquiries");
  console.log("   📍 GET /api/productinquiries/stats");
  console.log("   📍 GET /api/productinquiries/:id");
  console.log("   📍 PUT /api/productinquiries/:id");
  console.log("   📍 DELETE /api/productinquiries/:id");
} catch (error) {
  console.error("❌❌❌ PRODUCT INQUIRY ROUTES FAILED:", error.message);
}
// ============================================
// 🔥 END PRODUCT INQUIRY ROUTES 🔥
// ============================================

// ============================================
// 🔥 AI AGENT ROUTES 🔥
// ============================================
try {
  const aiAgentRoutes = require("./routes/aiAgentRoutes");
  app.use("/api/aiagents", aiAgentRoutes);
  console.log("✅✅✅ AI AGENT ROUTES REGISTERED ✅✅✅");
  console.log("   📍 POST /api/aiagents");
  console.log("   📍 GET /api/aiagents");
  console.log("   📍 GET /api/aiagents/categories/counts");
  console.log("   📍 GET /api/aiagents/delivery-methods/counts");
  console.log("   📍 GET /api/aiagents/publishers/counts");
  console.log("   📍 GET /api/aiagents/:id");
  console.log("   📍 PUT /api/aiagents/:id");
  console.log("   📍 DELETE /api/aiagents/:id");
} catch (error) {
  console.error("❌❌❌ AI AGENT ROUTES FAILED:", error.message);
}
// ============================================
// 🔥 END AI AGENT ROUTES 🔥
// ============================================

// ============================================
// 🔥 AI CATEGORY ROUTES 🔥
// ============================================
try {
  const aiCategoryRoutes = require("./routes/aiCategoryRoutes");
  app.use("/api/aicategories", aiCategoryRoutes);
  console.log("✅✅✅ AI CATEGORY ROUTES REGISTERED ✅✅✅");
  console.log("   📍 POST /api/aicategories");
  console.log("   📍 GET /api/aicategories");
  console.log("   📍 GET /api/aicategories/:id");
  console.log("   📍 PUT /api/aicategories/:id");
  console.log("   📍 DELETE /api/aicategories/:id");
} catch (error) {
  console.error("❌❌❌ AI CATEGORY ROUTES FAILED:", error.message);
}
// ============================================
// 🔥 END AI CATEGORY ROUTES 🔥
// ============================================

// ============================================
// 🔥 DELIVERY METHOD ROUTES 🔥
// ============================================
try {
  const deliveryMethodRoutes = require("./routes/deliveryMethodRoutes");
  app.use("/api/deliverymethods", deliveryMethodRoutes);
  console.log("✅✅✅ DELIVERY METHOD ROUTES REGISTERED ✅✅✅");
  console.log("   📍 POST /api/deliverymethods");
  console.log("   📍 GET /api/deliverymethods");
  console.log("   📍 GET /api/deliverymethods/:id");
  console.log("   📍 PUT /api/deliverymethods/:id");
  console.log("   📍 DELETE /api/deliverymethods/:id");
} catch (error) {
  console.error("❌❌❌ DELIVERY METHOD ROUTES FAILED:", error.message);
}
// ============================================
// 🔥 END DELIVERY METHOD ROUTES 🔥
// ============================================

// ============================================
// 🔥 PUBLISHER ROUTES 🔥
// ============================================
try {
  const publisherRoutes = require("./routes/publisherRoutes");
  app.use("/api/publishers", publisherRoutes);
  console.log("✅✅✅ PUBLISHER ROUTES REGISTERED ✅✅✅");
  console.log("   📍 POST /api/publishers");
  console.log("   📍 GET /api/publishers");
  console.log("   📍 GET /api/publishers/:id");
  console.log("   📍 PUT /api/publishers/:id");
  console.log("   📍 DELETE /api/publishers/:id");
} catch (error) {
  console.error("❌❌❌ PUBLISHER ROUTES FAILED:", error.message);
}
// ============================================
// 🔥 END PUBLISHER ROUTES 🔥
// ============================================

try {
  const filterRoutes = require("./routes/filterRoutes");
  app.use("/api/filters", filterRoutes);
  console.log("✅ Filter routes registered: /api/filters");
} catch (error) {
  console.error("❌ Error loading filter routes:", error.message);
}

// --- Health Check ---
app.get("/", (req, res) => {
  res.json({
    message: "✅ E-Commerce API is running",
    database: "PostgreSQL",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// --- API Status Endpoint ---
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    database: "PostgreSQL",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT,
  });
});

// ✅ PRODUCT IMPORT CRON JOB ROUTES
let cronInstance = null;

// Initialize and register cron job routes
const initializeCronJob = () => {
  try {
    // CORRECT PATH: Your file is in ./cron/productImportCron.js
    const ProductImportCron = require("./cron/productImportCron");
    cronInstance = new ProductImportCron();

    console.log("✅ Product Import Cron Job initialized with API endpoints");
  } catch (error) {
    console.error(
      "❌ Failed to initialize Product Import Cron Job:",
      error.message
    );
    // Don't crash the server if cron job fails to initialize
  }
};

// Manual trigger endpoint for cron job
app.get("/api/cron/trigger-import", async (req, res) => {
  try {
    if (!cronInstance) {
      return res.status(503).json({
        success: false,
        error: "Cron job not initialized",
      });
    }

    console.log("🔔 Manual trigger of import cron job via API");
    const result = await cronInstance.triggerManualImport();

    res.json({
      success: true,
      message: "Cron job triggered manually",
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error triggering cron job:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Manual trigger: import products from FTP cache (SKU + Brand → Icecat). GET so you can run from browser for testing.
const runFtpImportTrigger = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const base = `http://localhost:${process.env.PORT || 5051}`;
    const axiosRes = await axios.post(
      `${base}/api/products/import-from-ftp-cache?limit=${limit}&skip_existing=true`,
      {},
      { timeout: 600000 }
    );
    res.json(axiosRes.data);
  } catch (error) {
    console.error("❌ Trigger FTP import failed:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "FTP cache import failed",
    });
  }
};
app.get("/api/cron/trigger-ftp-import", runFtpImportTrigger);
app.post("/api/cron/trigger-ftp-import", runFtpImportTrigger);

// ---------- FTP cache fill: sync pages from vCloudTech API into DB cache (so cache grows toward full catalog) ----------
const FTP_CACHE_SYNC_STATE_PATH = path.join(__dirname, "data", "ftp_cache_sync_page.json");

const readFtpCacheSyncPage = () => {
  try {
    if (fs.existsSync(FTP_CACHE_SYNC_STATE_PATH)) {
      const raw = fs.readFileSync(FTP_CACHE_SYNC_STATE_PATH, "utf8");
      const o = JSON.parse(raw);
      return Math.max(1, parseInt(o.page, 10) || 1);
    }
  } catch (e) {
    console.warn("FTP cache sync state read failed:", e.message);
  }
  return 1;
};

const writeFtpCacheSyncPage = (page) => {
  try {
    const dir = path.dirname(FTP_CACHE_SYNC_STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FTP_CACHE_SYNC_STATE_PATH, JSON.stringify({ page: Math.max(1, page) }, null, 2));
  } catch (e) {
    console.warn("FTP cache sync state write failed:", e.message);
  }
};

const runFtpCacheSyncTrigger = async (req, res) => {
  try {
    const page = parseInt(req.query?.page || req.body?.page, 10) || readFtpCacheSyncPage();
    const maxPages = Math.min(Math.max(parseInt(req.query?.max_pages || req.body?.max_pages, 10) || 1, 1), 50);
    const perPage = Math.min(Math.max(parseInt(req.query?.per_page || req.body?.per_page, 10) || 100, 1), 200);
    const base = `http://localhost:${process.env.PORT || 5051}`;
    let totalUpserted = 0;
    let nextPage = page;
    for (let i = 0; i < maxPages; i++) {
      const p = nextPage;
      const axiosRes = await axios.post(
        `${base}/api/ftpproducts/cache/sync`,
        { page: p, per_page: perPage, distributor: req.body?.distributor || req.query?.distributor },
        { timeout: 120000 }
      );
      const upserted = axiosRes.data?.upserted ?? 0;
      totalUpserted += upserted;
      nextPage = p + 1;
      if (upserted === 0) break;
      if (i < maxPages - 1) await new Promise((r) => setTimeout(r, 200));
    }
    writeFtpCacheSyncPage(nextPage);
    res.json({
      success: true,
      message: `FTP cache sync: ${totalUpserted} items upserted`,
      pages_synced: nextPage - page,
      next_sync_page: nextPage,
      total_upserted: totalUpserted,
    });
  } catch (error) {
    console.error("❌ FTP cache sync trigger failed:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "FTP cache sync failed",
    });
  }
};
app.get("/api/cron/trigger-ftp-cache-sync", runFtpCacheSyncTrigger);
app.post("/api/cron/trigger-ftp-cache-sync", runFtpCacheSyncTrigger);

// ---------- vCloudTech FTP catalog → Icecat: 1 page (50 products) per run, store only when both match; skip through 44k+ pages ----------
const VCLOUDTECH_ICECAT_STATE_PATH = path.join(__dirname, "data", "vcloudtech_icecat_sync_page.json");
const PER_PAGE_FTP_ICECAT = 50;

const readVcloudtechIcecatPage = () => {
  try {
    if (fs.existsSync(VCLOUDTECH_ICECAT_STATE_PATH)) {
      const raw = fs.readFileSync(VCLOUDTECH_ICECAT_STATE_PATH, "utf8");
      const o = JSON.parse(raw);
      return Math.max(1, parseInt(o.page, 10) || 1);
    }
  } catch (e) {
    console.warn("vCloudTech Icecat sync state read failed:", e.message);
  }
  return 1;
};

const writeVcloudtechIcecatPage = (page) => {
  try {
    const dir = path.dirname(VCLOUDTECH_ICECAT_STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VCLOUDTECH_ICECAT_STATE_PATH, JSON.stringify({ page: Math.max(1, page) }, null, 2));
  } catch (e) {
    console.warn("vCloudTech Icecat sync state write failed:", e.message);
  }
};

const runVcloudtechIcecatSync = async (req, res) => {
  try {
    const page = parseInt(req.query?.page || req.body?.page, 10) || readVcloudtechIcecatPage();
    const maxPages = Math.min(Math.max(parseInt(req.query?.max_pages || req.body?.max_pages, 10) || 1, 1), 10);
    const perPage = parseInt(req.query?.per_page || req.body?.per_page, 10) || PER_PAGE_FTP_ICECAT;
    const base = `http://localhost:${process.env.PORT || 5051}`;
    const axiosRes = await axios.post(
      `${base}/api/products/sync-vcloudtech-to-icecat`,
      { page, per_page: Math.min(perPage, 100), max_pages: maxPages, distributor: req.body?.distributor || req.query?.distributor },
      { timeout: 600000 }
    );
    const data = axiosRes.data;
    const fetched = data?.summary?.fetched ?? 0;
    const matched = data?.summary?.matched ?? 0;
    const nextPage = fetched === 0 ? 1 : page + maxPages;
    writeVcloudtechIcecatPage(nextPage);
    if (res) {
      res.json({ ...data, next_sync_page: nextPage });
    }
    return { page, nextPage, fetched, matched };
  } catch (error) {
    console.error("❌ vCloudTech→Icecat sync failed:", error.message);
    if (res) res.status(500).json({ success: false, error: error.message || "vCloudTech→Icecat sync failed" });
    return null;
  }
};

app.get("/api/cron/trigger-vcloudtech-icecat-sync", (req, res) => runVcloudtechIcecatSync(req, res));
app.post("/api/cron/trigger-vcloudtech-icecat-sync", (req, res) => runVcloudtechIcecatSync(req, res));

// Check cron job status
app.get("/api/cron/status", (req, res) => {
  if (!cronInstance) {
    return res.status(503).json({
      error: "Cron job not initialized",
      status: "unavailable",
    });
  }

  res.json(cronInstance.getStatus());
});

// Get specific job status
app.get("/api/cron/job/:id", async (req, res) => {
  try {
    if (!cronInstance) {
      return res.status(503).json({
        error: "Cron job not initialized",
      });
    }

    const result = await cronInstance.getJobStatus(req.params.id);

    if (result.error) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/cron/ftp-icecat-status
 * Check if FTP + Icecat matching crons can run (credentials, cache rows).
 * Products are only stored when SKU+brand match in Icecat.
 */
app.get("/api/cron/ftp-icecat-status", async (req, res) => {
  try {
    const ftpEmail = process.env.FTP_API_EMAIL || "";
    const ftpPassword = process.env.FTP_API_PASSWORD || "";
    const ftpApiConfigured = !!(ftpEmail && ftpPassword);

    let ftpCacheRows = 0;
    if (db.FtpProductCache) {
      try {
        ftpCacheRows = await db.FtpProductCache.count();
      } catch (_) {
        ftpCacheRows = -1;
      }
    }

    const crons = {
      ftpCacheImport: {
        schedule: "*/10 * * * *",
        description: "Reads ftp_product_cache; for each SKU+brand calls Icecat; stores product only when Icecat matches.",
        needsCacheRows: true,
        cacheRows: ftpCacheRows,
      },
      ftpCacheFill: {
        schedule: "*/10 * * * *",
        description: "Fetches from vCloudTech API and fills ftp_product_cache (so FTP cache import has data).",
        needsFtpApi: true,
      },
      vcloudtechIcecat: {
        schedule: "*/10 * * * *",
        description: "Fetches from vCloudTech API, for each product calls Icecat by SKU+brand; stores only when Icecat matches.",
        needsFtpApi: true,
      },
    };

    let message = "FTP+Icecat matching is enabled. ";
    if (!ftpApiConfigured) {
      message += "Set FTP_API_EMAIL and FTP_API_PASSWORD in .env for FTP cache fill and vCloudTech→Icecat cron to fetch data. ";
    }
    if (ftpCacheRows === 0 && db.FtpProductCache) {
      message += "FTP cache has 0 rows – run FTP cache fill (or trigger /api/cron/trigger-ftp-cache-sync) to populate; then FTP cache import will match SKU+brand with Icecat. ";
    }
    if (ftpApiConfigured && ftpCacheRows > 0) {
      message += "FTP cache import cron will pick new rows and match with Icecat by SKU+brand. ";
    }

    res.json({
      success: true,
      ftpApiConfigured,
      ftpCacheRows: ftpCacheRows >= 0 ? ftpCacheRows : null,
      crons,
      message: message.trim(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all import jobs
app.get("/api/cron/jobs", async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    const whereClause = {};
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const jobs = await db.ProductImportJob.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        {
          model: db.ProductImportItem,
          as: "items",
          attributes: ["id", "status", "productCode", "brand", "errorMessage"],
        },
      ],
    });

    const totalJobs = await db.ProductImportJob.count({ where: whereClause });

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalJobs,
        pages: Math.ceil(totalJobs / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching import jobs:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Connect to Database and Start Server ---
// NOTE: On Windows + Cursor IDE, ports like 5000/5001 can be occupied by Cursor's internal NodeService
// which causes browsers/curl to hit the wrong process and show ERR_EMPTY_RESPONSE.
// Use 5051 by default; you can still override via PORT env var.
const PORT = process.env.PORT || 5051;

const startServer = async () => {
  try {
    console.log("🔄 Connecting to database...");

    // Connect to database
    await db.connectDB();
    console.log("✅ Database connected and synced");

    // ✅ SYNC ENUM FOR PRODUCT IMPORT STATUS
    try {
      const ProductForImport = require("./models/productForImport")(
        db.sequelize
      );
      if (
        ProductForImport.syncEnum &&
        typeof ProductForImport.syncEnum === "function"
      ) {
        console.log("🔄 Syncing enum values...");
        await ProductForImport.syncEnum();
        console.log("✅ Enum sync completed");
      } else {
        console.log("ℹ️ syncEnum function not available, skipping enum sync");
      }
    } catch (enumError) {
      console.log("ℹ️ Enum sync not required or failed:", enumError.message);
      // Don't crash the server if enum sync fails
    }

    // ✅ INITIALIZE PRODUCT IMPORT CRON JOB
    initializeCronJob();

    // Start the server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 API URL: http://localhost:${PORT}`);
      console.log(`🛒 Cart API: http://localhost:${PORT}/api/carts`);
      console.log(`📦 Order API: http://localhost:${PORT}/api/orders`);
      console.log(
        `⏰ Product Import Cron: http://localhost:${PORT}/api/cron/status`
      );
      console.log(
        `🔔 Manual Trigger: http://localhost:${PORT}/api/cron/trigger-import`
      );
      console.log(
        `📥 FTP cache fill: http://localhost:${PORT}/api/cron/trigger-ftp-cache-sync`
      );
      console.log(
        `🔄 FTP→Icecat (50/page, 44k pages): http://localhost:${PORT}/api/cron/trigger-vcloudtech-icecat-sync`
      );
      console.log(
        `📋 FTP+Icecat status (SKU+brand match): http://localhost:${PORT}/api/cron/ftp-icecat-status`
      );
      const ftpEmail = (process.env.FTP_API_EMAIL || "").trim();
      const ftpPassword = process.env.FTP_API_PASSWORD != null ? String(process.env.FTP_API_PASSWORD).trim() : "";
      if (ftpEmail && ftpPassword) {
        console.log("✅ FTP API credentials: loaded (FTP_API_EMAIL is set; cache fill & vCloudTech→Icecat will use them)");
      } else {
        console.log("⚠️ FTP API credentials: missing – set FTP_API_EMAIL and FTP_API_PASSWORD in backend/.env for cache fill & FTP→Icecat");
      }

      // Run FTP cache import once after 15s on startup (for testing). Disable later via RUN_FTP_IMPORT_ON_STARTUP=false
      const runFtpImportOnStartup = process.env.RUN_FTP_IMPORT_ON_STARTUP !== "false";
      if (runFtpImportOnStartup) {
        setTimeout(async () => {
          try {
            const base = `http://localhost:${PORT}`;
            console.log("📥 [Testing] Running FTP cache import once...");
            const res = await axios.post(
              `${base}/api/products/import-from-ftp-cache?limit=30&skip_existing=true`,
              {},
              { timeout: 600000 }
            );
            const msg = res.data?.message || res.data;
            if (res.data?.results?.total === 0 && !res.data?.jobId)
              console.log("ℹ️ FTP cache import (startup):", msg || "No import (cache model may be missing).");
            else
              console.log("✅ FTP cache import (startup) completed:", msg || res.data);
          } catch (e) {
            const status = e.response?.status;
            const detail = e.response?.data?.error || e.message;
            console.warn("⚠️ FTP cache import (startup) failed:", detail || e.message, status ? `(HTTP ${status})` : "");
            console.warn("   Set RUN_FTP_IMPORT_ON_STARTUP=false to disable.");
          }
        }, 15000);
        console.log("📥 FTP cache import will run once in 15s (testing). Set RUN_FTP_IMPORT_ON_STARTUP=false to disable.");
      }

      // Auto-import from FTP cache every 10 min – only new SKUs (no duplicates)
      const ftpCronSchedule = "*/10 * * * *";
      cron.schedule(ftpCronSchedule, () => {
        const run = async () => {
          console.log("🕒 [Cron] FTP cache auto-import tick (every 10 min) – running...");
          try {
            const base = `http://localhost:${PORT}`;
            const res = await axios.post(
              `${base}/api/products/import-from-ftp-cache?limit=30&skip_existing=true`,
              {},
              { timeout: 600000 }
            );
            const msg = res.data?.message || res.data;
            console.log("✅ [Cron] FTP cache auto-import completed:", msg);
            if (res.data?.results?.total === 0 && String(msg || "").toLowerCase().includes("no new"))
              console.log("ℹ️ [Cron] No new products to import this run (all skipped or already in DB/attempted). Next run in 10 min.");
          } catch (e) {
            const detail = e.response?.data?.error || e.message;
            console.warn("⚠️ [Cron] FTP cache auto-import failed:", detail || e.message, e.response?.status ? `(HTTP ${e.response.status})` : "");
          }
        };
        run().catch((err) => console.error("❌ [Cron] FTP import run error:", err.message));
      });
      console.log("📥 FTP cache auto-import scheduled (" + ftpCronSchedule + "). Logs: 🕒 tick, ✅ completed, ❌ failed.");

      // FTP cache fill: sync next page from vCloudTech API into DB so cache grows toward full catalog (2.2M+ products).
      const ftpCacheCronSchedule = process.env.FTP_CACHE_SYNC_CRON_SCHEDULE || "*/10 * * * *";
      if (ftpCacheCronSchedule) {
        cron.schedule(ftpCacheCronSchedule, () => {
          const run = async () => {
            console.log("🕒 [Cron] FTP cache fill – syncing next page from vCloudTech API...");
            try {
              const page = readFtpCacheSyncPage();
              const base = `http://localhost:${PORT}`;
              const res = await axios.post(
                `${base}/api/ftpproducts/cache/sync`,
                { page, per_page: 100 },
                { timeout: 120000 }
              );
              const upserted = res.data?.upserted ?? 0;
              const nextPage = upserted === 0 ? 1 : page + 1;
              writeFtpCacheSyncPage(nextPage);
              console.log("✅ [Cron] FTP cache fill: page " + page + " → " + upserted + " items, next_page=" + nextPage);
            } catch (e) {
              console.error("❌ [Cron] FTP cache fill failed:", e.message);
            }
          };
          run().catch((err) => console.error("❌ [Cron] FTP cache fill run error:", err.message));
        });
        console.log("📥 FTP cache fill cron (" + ftpCacheCronSchedule + "). Manual: GET/POST /api/cron/trigger-ftp-cache-sync");
      }

      // vCloudTech FTP catalog → Icecat: 1 page (50 products) per run; store only when both match; advance through 44k+ pages.
      const vcloudtechIcecatSchedule = process.env.VCLOUDTECH_ICECAT_CRON_SCHEDULE || "*/10 * * * *";
      if (vcloudtechIcecatSchedule) {
        cron.schedule(vcloudtechIcecatSchedule, () => {
          const run = async () => {
            console.log("🕒 [Cron] FTP catalog→Icecat: fetching next page (50 products), matching Icecat by SKU+brand...");
            try {
              const result = await runVcloudtechIcecatSync({}, null);
              if (result) {
                console.log("✅ [Cron] FTP→Icecat: page " + result.page + " → fetched=" + result.fetched + ", matched=" + result.matched + " (SKU+brand in Icecat), next_page=" + result.nextPage);
              } else {
                console.warn("⚠️ [Cron] FTP→Icecat: no result (check FTP_API_EMAIL/FTP_API_PASSWORD or API errors).");
              }
            } catch (e) {
              console.error("❌ [Cron] FTP→Icecat failed:", e.message);
            }
          };
          run().catch((err) => console.error("❌ [Cron] FTP→Icecat run error:", err.message));
        });
        console.log("🔄 FTP→Icecat cron (" + vcloudtechIcecatSchedule + "): 50 products/page, store only when FTP+Icecat match. Manual: GET/POST /api/cron/trigger-vcloudtech-icecat-sync");
      }
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app;
