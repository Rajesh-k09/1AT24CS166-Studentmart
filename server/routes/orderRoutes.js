const express = require("express");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const { authenticate, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Helper to generate unique order ID like SM-4083
async function generateOrderId() {
  for (let i = 0; i < 20; i++) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const candidate = `SM-${randomDigits}`;
    const exists = await Order.findOne({ orderId: candidate });
    if (!exists) return candidate;
  }
  return `SM-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
}

/* =========================================
   1. CREATE NEW CAMPUS ORDER (CUSTOMER)
   POST /api/orders
   ========================================= */
router.post("/", authenticate, async (req, res) => {
  try {
    const { items, deliveryLocation, deliveryNotes, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add products to your cart before placing an order.",
      });
    }

    let computedTotal = 0;
    const formattedItems = [];

    for (const rawItem of items) {
      const price = Number(rawItem.price);
      const quantity = Math.max(1, Number(rawItem.quantity) || 1);

      if (isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for item: ${rawItem.title || rawItem.name || "Product"}`,
        });
      }

      computedTotal += price * quantity;

      const prodId = rawItem.productId || rawItem.product || rawItem._id || rawItem.id;
      const isValidObjectId = prodId && /^[0-9a-fA-F]{24}$/.test(prodId.toString());

      formattedItems.push({
        product: isValidObjectId ? prodId : null,
        title: rawItem.title || rawItem.name || "Campus Product",
        price,
        quantity,
        image: rawItem.image || "",
        category: rawItem.category || "General",
      });

      // Automatically decrement stock in the catalog
      if (isValidObjectId) {
        try {
          const productDoc = await Product.findById(prodId);
          if (productDoc && productDoc.stock !== undefined) {
            productDoc.stock = Math.max(0, productDoc.stock - quantity);
            await productDoc.save();
          }
        } catch (stockErr) {
          console.warn("Could not adjust product stock:", prodId, stockErr.message);
        }
      }
    }

    const orderId = await generateOrderId();

    const order = new Order({
      orderId,
      customer: req.user._id,
      customerName: req.user.name || req.body.customerName || "Student Customer",
      customerEmail: req.user.email || req.body.customerEmail || "",
      customerPhone: req.user.phone || req.body.customerPhone || "",
      customerUsn: req.user.usn || req.body.customerUsn || "",
      deliveryLocation:
        deliveryLocation ||
        req.body.deliveryAddress ||
        (req.user.college ? `${req.user.college} - Campus Counter` : "Campus Counter / Direct Handover"),
      deliveryNotes: deliveryNotes || "",
      items: formattedItems,
      totalAmount: computedTotal,
      status: "Pending",
      paymentMethod: paymentMethod || "Campus Cash on Delivery / UPI on Handover",
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: `Order #${order.orderId} placed successfully! The campus store admin has received your order.`,
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to place order.",
    });
  }
});

/* =========================================
   2. GET ALL ORDERS (ADMIN ONLY)
   GET /api/orders
   ========================================= */
router.get("/", authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email phone usn department college")
      .sort({ createdAt: -1 });

    // Aggregate statistics
    const allOrders = await Order.find();
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === "Pending").length;
    const readyOrders = allOrders.filter((o) => o.status === "Ready for Pickup").length;
    const completedOrders = allOrders.filter((o) => o.status === "Completed").length;
    const cancelledOrders = allOrders.filter((o) => o.status === "Cancelled").length;
    const totalRevenue = allOrders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return res.status(200).json({
      success: true,
      orders,
      stats: {
        totalOrders,
        pendingOrders,
        readyOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders.",
    });
  }
});

/* =========================================
   3. GET MY ORDERS (LOGGED-IN CUSTOMER)
   GET /api/orders/my-orders
   ========================================= */
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your order history.",
    });
  }
});

/* =========================================
   4. UPDATE ORDER STATUS (ADMIN ONLY)
   PATCH /api/orders/:id/status
   PUT /api/orders/:id/status
   ========================================= */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Ready for Pickup", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderId} status updated to "${status}".`,
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status.",
    });
  }
};

router.patch("/:id/status", authenticate, isAdmin, updateOrderStatus);
router.put("/:id/status", authenticate, isAdmin, updateOrderStatus);

/* =========================================
   5. DELETE ORDER (ADMIN ONLY)
   DELETE /api/orders/:id
   ========================================= */
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderId} deleted successfully.`,
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order.",
    });
  }
});

module.exports = router;
