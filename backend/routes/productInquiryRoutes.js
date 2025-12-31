const express = require("express");
const router = express.Router();
const {
  createProductInquiry,
  getProductInquiries,
  getProductInquiry,
  updateProductInquiry,
  deleteProductInquiry,
  getInquiryStats,
} = require("../controllers/productInquiryController");

// CRUD routes
router.post("/", createProductInquiry);
router.get("/", getProductInquiries);
router.get("/stats", getInquiryStats);
router.get("/:id", getProductInquiry);
router.put("/:id", updateProductInquiry);
router.delete("/:id", deleteProductInquiry);

module.exports = router;

