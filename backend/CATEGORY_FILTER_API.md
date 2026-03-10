# Category / Subcategory Filter API

## Problem

When the backend filtered **only by `subCategoryId`**, some category filters worked and some did not:

- **Subcategory clicks** (e.g. "Mice"): worked when products had `subCategoryId` set; failed when products only had `categoryId`.
- **Parent category clicks** (e.g. "Electronics"): failed when the frontend sent the **category** id, because the backend only matched `subCategoryId`.

The frontend sends a single `id` in a common param (e.g. `category`, `categoryId`, or `subcategoryId`). That id can be either a **category** (parent) or a **subcategory** (child). The backend must handle both so behavior is consistent.

---

## Solution: Unified category filter

The backend applies a **unified filter** so one id works for both categories and subcategories:

```text
(subCategoryId = :id OR categoryId = :id OR subCategoryId IN (children of category :id))
```

- **Subcategory click** (e.g. id = Mice’s subcategory id):  
  Products with `subCategoryId = id` or `categoryId = id` are included.

- **Parent category click** (e.g. id = Electronics’ category id):  
  Products with `categoryId = id` are included, **and** products whose `subCategoryId` is one of the subcategories with `parentId = id` (children of Electronics) are included.

So the frontend can always send **one id** (category or subcategory); the backend resolves it against both `categoryId` and `subCategoryId`, and for parent categories also resolves parent → children subcategory ids.

---

## Endpoints

### GET /api/products

Query params:

| Param          | Description |
|----------------|-------------|
| `categoryId`   | Single category or subcategory id; unified filter applied. |
| `category`     | Alias for categoryId. |
| `subcategoryId`| Alias for categoryId. |

Example: `GET /api/products?category=5` returns products where `subCategoryId = 5` OR `categoryId = 5` OR `subCategoryId` is in the list of subcategories with `parentId = 5`.

---

### GET /api/products/filter/category

Query params:

| Param           | Description |
|-----------------|-------------|
| `categoryId`    | Single category or subcategory id; unified filter applied. |
| `category`      | Alias for categoryId. |
| `subcategoryId` | Alias for categoryId. |
| `categoryName`  | Category title (e.g. "Electronics"); resolved to id then unified filter. |

Same unified logic: `(subCategoryId = id OR categoryId = id OR subCategoryId IN (children of id))`.

---

### GET /api/products/filter/category-manufacturer

Same category params as above (`categoryId`, `category`, `subcategoryId`, or `categoryName`) plus `mfr`. Category filter uses the same unified logic.

---

## Frontend usage

- Send **one id** in a common param for every category/subcategory click, e.g. `categoryId`, `category`, or `subcategoryId`.
- No need to distinguish category vs subcategory on the frontend for filtering; the backend applies the same rule for both.
- Response may include `filter.unified: true` to indicate unified filter was used.

---

## Implementation note

Helper `getCategoryFilterWhere(id)` in `productController.js`:

1. Resolves subcategory ids with `parentId = id` (children of the category).
2. Returns `{ [Op.or]: [ { subCategoryId: id }, { categoryId: id }, { subCategoryId: { [Op.in]: childIds } } ] }`.

Used by:

- `getProducts` (when `categoryId` / `category` / `subcategoryId` is present),
- `filterByCategory`,
- `filterByCategoryAndManufacturer`.
