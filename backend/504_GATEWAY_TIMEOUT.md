# 504 Gateway Timeout – Troubleshooting

## What 504 means

**504 Gateway Timeout** means the server that received the request (the *gateway*, e.g. nginx, Next.js proxy, or load balancer) did not get a response from the *upstream* (this Node/Express backend) within its timeout window. The browser hits something on port **3005**; that something forwards `/api/*` to your backend (e.g. port **5000**). If the backend is slow or unreachable, the gateway returns 504.

## Common causes

1. **Backend not reachable** – Wrong host/port, firewall, or backend process not running.
2. **Proxy timeout too short** – Defaults are often 60s; heavy endpoints can exceed that.
3. **Slow backend** – Heavy queries (e.g. listing thousands of products with joins) or missing DB indexes.

## What we did in this repo

- **Fast health check** – `GET /api/health` returns immediately (no DB). Use it to verify the backend is up and that the gateway can reach it. If `/api/health` returns 200 but `/api/products` returns 504, the issue is slow endpoints or proxy timeout.
- **Pagination on imports** – `GET /api/products/imports` now supports `page` and `limit` (default `limit=20`, max `100`) so it no longer loads the entire product set in one request.
- **Categories** – `GET /api/categories` supports `includeSubcategories=true` and `limit` so the storefront can request a bounded list.

## What you should do

### 1. Point the “other frontend” to the real backend

If the storefront uses base URL `http://199.188.207.24:3005`, ensure:

- Either the **backend runs on 3005** (set `PORT=3005` and run the Node server there),  
- Or **3005 is a reverse proxy** that forwards `/api/*` to the backend (e.g. `http://127.0.0.1:5000`). In that case, **increase the proxy’s upstream timeout** (e.g. nginx `proxy_read_timeout 120;` or your platform’s equivalent to 90–120 seconds).

### 2. Check backend is up

```bash
curl http://199.188.207.24:5000/api/health
# or, if the backend is behind the same host on 3005:
curl http://199.188.207.24:3005/api/health
```

If this returns `{"ok":true,"ts":"..."}` quickly, the backend is reachable. If this also times out, the problem is network/firewall or the backend not listening.

### 3. Increase gateway/proxy timeout

- **Nginx**: `proxy_read_timeout 120s;` (and optionally `proxy_connect_timeout`, `proxy_send_timeout`).
- **Next.js rewrites/proxy**: Configure the HTTP client or proxy timeout (e.g. 90–120 seconds) for requests to the backend.
- **Other platforms**: Set the “upstream” or “backend” timeout to at least 90–120 seconds.

### 4. Optional: database indexes

If `/api/products` or `/api/filters/brands-and-subcategories` are still slow after timeouts are increased, add indexes on the `products` table for:

- `product_source` (or `productSource`)
- `brand_id` (or `brandId`)
- `sub_category_id` (or `subCategoryId`)
- `category_id` (or `categoryId`)

(Exact column names depend on your Sequelize schema; check the table in PostgreSQL.)

## Stripe error on the storefront

The message *"Please call Stripe() with your publishable key. You used an empty string"* comes from the **frontend** (storefront app). That app must either:

- Set a valid Stripe publishable key in its config, or  
- Avoid initializing Stripe when the key is empty (e.g. only load Stripe when the key is present).

The backend in this repo does not send the Stripe publishable key to the storefront; the storefront reads it from its own environment/build config.
