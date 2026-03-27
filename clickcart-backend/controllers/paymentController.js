import razorpay from "../config/razorpay.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import crypto from "crypto";
import mongoose from "mongoose";

export const createRazorpayOrder = async (req, res) => {
  try {
    const shippingPrice = Number(req.body.shippingPrice) || 0;
    const itemsPrice = Number(req.body.itemsPrice) || 0;

    if (!itemsPrice || itemsPrice <= 0) {
      return res.status(400).json({ message: "Invalid items price" });
    }

    const totalPrice = itemsPrice + shippingPrice;

    const options = {
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });

  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ error: error.message });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice
    } = req.body;

    //checking all razorpay fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    //signature verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    const isCartFlow = cart && cart.items.length > 0;

    //build final order items
    let finalOrderItems = [];

    if (isCartFlow) {
      finalOrderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }));
    } else {
      if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: "No order items provided" });
      }
      finalOrderItems = orderItems.map(item => ({
        product: new mongoose.Types.ObjectId(item.product),
        quantity: item.quantity,
        price: item.price
      }));
    }

    if (!finalOrderItems.length) {
      return res.status(400).json({ message: "No order items" });
    }

    //validate stock for all items
    for (const item of finalOrderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
    }

    //resolve shipping address
    const finalShippingAddress = shippingAddress || {
      address: "Default Address",
      city: "Default City",
      postalCode: "000000",
      country: "India"
    };

    //resolve prices
    let finalItemsPrice = 0;

    if (isCartFlow) {
      cart.items.forEach(item => {
        finalItemsPrice += item.product.price * item.quantity;
      });
    } else {
      finalItemsPrice = Number(itemsPrice) || 0;
    }

    const finalShippingPrice = Number(shippingPrice) || 0;

    const totalPrice = finalItemsPrice + finalShippingPrice;

    let order;
    try {
      order = await Order.create({
        user: req.user._id,
        orderItems: finalOrderItems,
        shippingAddress: finalShippingAddress,
        itemsPrice: finalItemsPrice,
        shippingPrice: finalShippingPrice,
        totalPrice,
        paymentStatus: "paid",
        paymentResult: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        },
        orderStatus: "placed",
        timeline: [{ status: "placed", date: new Date() }]
      });
    } catch (createErr) {
      console.error("ORDER CREATE FAILED:", createErr.message);
      return res.status(400).json({ message: "Order creation failed", error: createErr.message });
    }

    //stock reduction
    for (const item of finalOrderItems) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    //clear cart only if cart flow
    if (isCartFlow && cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, order });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: error.message });
  }
};