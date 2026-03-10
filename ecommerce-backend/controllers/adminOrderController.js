import Order from "../models/Order.js";

export const getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByIdAdmin = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatusAdmin = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { status } = req.body;

    const validStatuses = [
      "placed",
      "confirmed",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    order.orderStatus = status;

    order.timeline.push({
      status,
      date: new Date()
    });

    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};