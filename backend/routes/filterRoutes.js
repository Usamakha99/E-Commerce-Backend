const express = require("express");
const router = express.Router();
const filterController = require("../controllers/filterController");

router.get("/brands-and-subcategories", filterController.getBrandsAndSubcategories);
router.get("/sidebar", filterController.getSidebarFilters);

module.exports = router;
