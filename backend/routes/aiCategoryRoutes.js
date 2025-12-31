const express = require("express");
const router = express.Router();
const {
  createAICategory,
  getAICategories,
  getAICategory,
  updateAICategory,
  deleteAICategory,
} = require("../controllers/aiCategoryController");

// CRUD routes
router.post("/", createAICategory);
router.get("/", getAICategories);
router.get("/:id", getAICategory);
router.put("/:id", updateAICategory);
router.delete("/:id", deleteAICategory);

module.exports = router;

