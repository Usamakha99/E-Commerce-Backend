const express = require("express");
const router = express.Router();
const {
  createDeliveryMethod,
  getDeliveryMethods,
  getDeliveryMethod,
  updateDeliveryMethod,
  deleteDeliveryMethod,
} = require("../controllers/deliveryMethodController");

// CRUD routes
router.post("/", createDeliveryMethod);
router.get("/", getDeliveryMethods);
router.get("/:id", getDeliveryMethod);
router.put("/:id", updateDeliveryMethod);
router.delete("/:id", deleteDeliveryMethod);

module.exports = router;

