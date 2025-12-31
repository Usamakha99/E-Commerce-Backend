const express = require("express");
const router = express.Router();
const {
  createAIAgent,
  getAIAgents,
  getAIAgent,
  updateAIAgent,
  deleteAIAgent,
  getCategoriesWithCounts,
  getDeliveryMethodsWithCounts,
  getPublishersWithCounts,
} = require("../controllers/aiAgentController");

// CRUD routes for AI Agents
router.post("/", createAIAgent);
router.get("/", getAIAgents);
router.get("/categories/counts", getCategoriesWithCounts);
router.get("/delivery-methods/counts", getDeliveryMethodsWithCounts);
router.get("/publishers/counts", getPublishersWithCounts);
router.get("/:id", getAIAgent);
router.put("/:id", updateAIAgent);
router.delete("/:id", deleteAIAgent);

module.exports = router;

