# Backend API – Frontend contract (brand & category filters)

This document describes how the **other frontend** sends brand and category filters and how the backend responds, so both stay in sync.

---

## Brand filter

### What the frontend sends

The frontend sends brand filter using **multiple param names** so backends that expect either id or name work:

**By id (multiple values):**

- `brandId` – e.g. `brandId=1&brandId=2`
- `brand_id` – same values, e.g. `brand_id=1&brand_id=2`

**By name (comma-separated):**

- `brands` – e.g. `brands=HP,Dell`
- `brand` – e.g. `brand=HP,Dell`

The frontend does **not** fall back to unfiltered results when a brand is selected: with a brand filter you get either matching products or an empty list, never the full catalog.

### What the backend does (GET /api/products)

The backend **filters** `GET /api/products` using at least one of:

- **By id:** `brandId` or `brand_id` (multiple values supported). Products with `brandId` in the given list are returned.
- **By name:** `brands` or `brand` (comma-separated). Names are resolved to brand ids (case-insensitive match on `Brand.title`), then products with `brandId` in that list are returned.

Id and name params can be combined; the result is the **union** of all brand ids (by id + by name), then filter by `brandId IN (...)`.

Response includes the **filtered** list and **filtered** total/pagination (total count and pages are for the filtered set, not the full catalog).

---

## Category filter

See **CATEGORY_FILTER_API.md** for full details. Summary:

- One param covers both category and subcategory: `categoryId`, `category`, or `subcategoryId`.
- Backend applies: `(subCategoryId = :id OR categoryId = :id OR subCategoryId IN (children of category :id))`.
- Filtered total and pagination are returned.

---

## Endpoints

| Endpoint | Brand params | Category params |
|----------|--------------|------------------|
| **GET /api/products** | `brandId`, `brand_id`, `brands`, `brand` | `categoryId`, `category`, `subcategoryId` |
| **GET /api/products/filter/category** | — | `categoryId`, `category`, `subcategoryId`, `categoryName` |
| **GET /api/products/filter** (filterProducts) | `brands` (comma-separated names) | `categories` (names) |

For the storefront grid, **GET /api/products** with optional `brandId`/`brand_id`/`brands`/`brand` and optional `categoryId`/`category`/`subcategoryId` is the main endpoint; it returns filtered data and correct pagination.
