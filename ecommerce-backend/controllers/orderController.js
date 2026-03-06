import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Cart has no items" });
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress: req.body.shippingAddress,
      totalPrice,
      orderStatus: "created",
      timeline: [
        { status: "created", date: new Date() }
      ]
    });

    await order.save();

    // inventory update
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) continue;

      if (product.countInStock < item.quantity) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      product.countInStock -= item.quantity;
      await product.save();
    }

    // clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getOrders = async (req, res) => {
  try {

    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getOrderById = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const updateOrderStatus = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const validStatuses = [
      "created",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ];

    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    order.orderStatus = req.body.status;

    order.timeline.push({
      status: req.body.status,
      date: new Date()
    });

    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const cancelOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.orderStatus = "cancelled";

    order.timeline.push({
      status: "cancelled",
      date: new Date()
    });

    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
