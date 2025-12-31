const db = require("../config/db");
const ProductInquiry = db.ProductInquiry;
const Product = db.Product;
const emailService = require("../services/emailService");

exports.createProductInquiry = async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      companyName,
      city,
      country,
      helpType,
      productId,
      productName,
      message,
    } = req.body;

    // Validate required fields
    if (!username || !firstName || !lastName || !email || !country || !helpType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // If productId is provided, verify product exists
    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }
    }

    const inquiry = await ProductInquiry.create({
      username,
      firstName,
      lastName,
      email,
      companyName,
      city,
      country,
      helpType,
      productId: productId || null,
      productName: productName || null,
      message: message || null,
      status: "pending",
    });

    // Include product details if productId exists
    const inquiryWithProduct = await ProductInquiry.findByPk(inquiry.id, {
      include: productId
        ? [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "sku", "mainImage"],
            },
          ]
        : [],
    });

    // Send email notification to admin
    try {
      await emailService.sendInquiryNotificationEmail(inquiryWithProduct);
      console.log("✅ Inquiry notification email sent to admin");
    } catch (emailError) {
      console.error("❌ Failed to send inquiry notification email:", emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to customer
    try {
      await emailService.sendInquiryConfirmationEmail(inquiryWithProduct);
      console.log("✅ Inquiry confirmation email sent to customer");
    } catch (emailError) {
      console.error("❌ Failed to send inquiry confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiryWithProduct,
    });
  } catch (err) {
    console.error("Error creating product inquiry:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getProductInquiries = async (req, res) => {
  try {
    const {
      status,
      helpType,
      country,
      productId,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (helpType) {
      whereClause.helpType = helpType;
    }

    if (country) {
      whereClause.country = country;
    }

    if (productId) {
      whereClause.productId = parseInt(productId);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: inquiries } = await ProductInquiry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "sku", "mainImage"],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching product inquiries:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getProductInquiry = async (req, res) => {
  try {
    const inquiry = await ProductInquiry.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "sku", "mainImage"],
          required: false,
        },
      ],
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: "Product inquiry not found",
      });
    }

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (err) {
    console.error("Error fetching product inquiry:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateProductInquiry = async (req, res) => {
  try {
    const inquiry = await ProductInquiry.findByPk(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: "Product inquiry not found",
      });
    }

    const {
      status,
      notes,
      message,
      helpType,
    } = req.body;

    // Update allowed fields
    if (status) inquiry.status = status;
    if (notes !== undefined) inquiry.notes = notes;
    if (message !== undefined) inquiry.message = message;
    if (helpType) inquiry.helpType = helpType;

    await inquiry.save();

    const updatedInquiry = await ProductInquiry.findByPk(inquiry.id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "sku", "mainImage"],
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      message: "Inquiry updated successfully",
      data: updatedInquiry,
    });
  } catch (err) {
    console.error("Error updating product inquiry:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteProductInquiry = async (req, res) => {
  try {
    const inquiry = await ProductInquiry.findByPk(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: "Product inquiry not found",
      });
    }

    await inquiry.destroy();

    res.json({
      success: true,
      message: "Product inquiry deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting product inquiry:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get inquiry statistics
exports.getInquiryStats = async (req, res) => {
  try {
    const { Op } = require("sequelize");
    
    const total = await ProductInquiry.count();
    const pending = await ProductInquiry.count({ where: { status: "pending" } });
    const inProgress = await ProductInquiry.count({ where: { status: "in_progress" } });
    const resolved = await ProductInquiry.count({ where: { status: "resolved" } });
    const closed = await ProductInquiry.count({ where: { status: "closed" } });

    const helpTypeStats = await ProductInquiry.findAll({
      attributes: [
        "helpType",
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      group: ["helpType"],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        status: {
          total: total || 0,
          pending: pending || 0,
          inProgress: inProgress || 0,
          resolved: resolved || 0,
          closed: closed || 0,
        },
        helpTypes: helpTypeStats || [],
      },
    });
  } catch (err) {
    console.error("Error fetching inquiry stats:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

