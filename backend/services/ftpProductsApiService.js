/**
 * FTP Products API client (per API_DOCUMENTATION.html).
 * Use alongside Icecat: FTP provides catalog (mfr_sku, vendor_name, description, upc);
 * Icecat enriches images/description when missing.
 */
const axios = require("axios");
const path = require("path");
// Load .env from backend directory (parent of services/) so FTP_API_* are available
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// FTP API base URL – set in .env as FTP_API_BASE_URL, or change default here
const FTP_API_BASE_URL =
  process.env.FTP_API_BASE_URL || "https://test.vcloudtech.net/api";
const FTP_API_EMAIL = (process.env.FTP_API_EMAIL || "").trim();
const FTP_API_PASSWORD = process.env.FTP_API_PASSWORD != null ? String(process.env.FTP_API_PASSWORD).trim() : "";

let cachedToken = null;

/**
 * Login and get Bearer token. Required for all FTP product endpoints.
 * @returns {Promise<string>} Bearer token
 */
async function getToken() {
  if (cachedToken) return cachedToken;

  if (!FTP_API_EMAIL || !FTP_API_PASSWORD) {
    throw new Error(
      "FTP API credentials missing. Set FTP_API_EMAIL and FTP_API_PASSWORD in .env"
    );
  }

  const response = await axios.post(
    `${FTP_API_BASE_URL}/auth/login`,
    {
      email: FTP_API_EMAIL,
      password: FTP_API_PASSWORD,
    },
    {
      timeout: 15000,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      validateStatus: (s) => s === 201 || s === 200,
    }
  );

  const data = response.data;
  const token = data.token || data.access_token;
  if (!token) {
    throw new Error(
      data.message || data.error || "FTP API login did not return a token"
    );
  }

  cachedToken = token;
  return token;
}

/**
 * Clear cached token (e.g. after 401).
 */
function clearToken() {
  cachedToken = null;
}

/**
 * Get paginated FTP products.
 * @param {Object} params - Query params: page, per_page, search, search_field, search_value, sort_by, sort_direction, distributor, include_icecat
 * @returns {Promise<{ data: Array, meta: Object, filters: Object }>}
 */
async function getProducts(params = {}) {
  const doRequest = async (token) => {
    const response = await axios.get(`${FTP_API_BASE_URL}/ftp-products`, {
      params: {
        page: params.page || 1,
        per_page: Math.min(Number(params.per_page) || 50, 200),
        search: params.search,
        search_field: params.search_field,
        search_value: params.search_value,
        sort_by: params.sort_by || "id",
        sort_direction: params.sort_direction || "asc",
        distributor: params.distributor,
        include_icecat: params.include_icecat === true || params.include_icecat === "true" || params.include_icecat === "1",
      },
      timeout: 60000,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (s) => s === 200 || s === 401,
    });
    return response;
  };

  let token = await getToken();
  let response = await doRequest(token);
  if (response.status === 401) {
    clearToken();
    token = await getToken();
    response = await doRequest(token);
  }
  if (response.status === 401) {
    clearToken();
    throw new Error(
      "FTP API unauthorized. Check FTP_API_EMAIL and FTP_API_PASSWORD in .env (vCloudTech login)."
    );
  }

  const body = response.data;
  if (!body.success && body.error) {
    throw new Error(body.message || body.error);
  }

  return {
    data: body.data || [],
    meta: body.meta || {},
    filters: body.filters || {},
  };
}

/**
 * Get single FTP product by ID.
 * @param {number} id - Product ID
 * @param {string} [tableName] - Optional table name hint
 * @returns {Promise<Object>}
 */
async function getProductById(id, tableName = null) {
  const doRequest = async (token) => {
    return await axios.get(`${FTP_API_BASE_URL}/ftp-products/${id}`, {
      params: tableName ? { table_name: tableName } : {},
      timeout: 15000,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (s) => s === 200 || s === 404 || s === 401,
    });
  };
  let token = await getToken();
  let response = await doRequest(token);
  if (response.status === 401) {
    clearToken();
    token = await getToken();
    response = await doRequest(token);
  }
  if (response.status === 401) {
    clearToken();
    throw new Error("FTP API unauthorized. Check FTP_API_EMAIL and FTP_API_PASSWORD in .env");
  }

  if (response.status === 404) {
    return null;
  }

  const body = response.data;
  if (!body.success) return null;
  return body.data || null;
}

module.exports = {
  getToken,
  clearToken,
  getProducts,
  getProductById,
  FTP_API_BASE_URL,
};
