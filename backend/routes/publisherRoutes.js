const express = require("express");
const router = express.Router();
const {
  createPublisher,
  getPublishers,
  getPublisher,
  updatePublisher,
  deletePublisher,
} = require("../controllers/publisherController");

// CRUD routes
router.post("/", createPublisher);
router.get("/", getPublishers);
router.get("/:id", getPublisher);
router.put("/:id", updatePublisher);
router.delete("/:id", deletePublisher);

module.exports = router;

