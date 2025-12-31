const express = require("express");
const router = express.Router();
const {
  createProductTag,
  getProductTags,
  getProductTag,
  updateProductTag,
  deleteProductTag,
  addProductsToTag,
  removeProductsFromTag,
} = require("../controllers/productTagController");

// CRUD routes
router.post("/", createProductTag);
router.get("/", getProductTags);
router.get("/:id", getProductTag);
router.put("/:id", updateProductTag);
router.delete("/:id", deleteProductTag);

// Product association routes
router.post("/:id/products", addProductsToTag);
router.post("/:id/products/remove", removeProductsFromTag);

module.exports = router;

