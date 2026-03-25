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

    // 1. Check all razorpay fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    // 2. Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    console.log("SECRET USED:", JSON.stringify(process.env.RAZORPAY_KEY_SECRET));
    console.log("EXPECTED:", expectedSignature);
    console.log("RECEIVED:", razorpay_signature);
    console.log("MATCH:", expectedSignature === razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // 3. Try to find cart — but don't block if empty, fall back to orderItems from body
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    const isCartFlow = cart && cart.items.length > 0;

    console.log("IS CART FLOW:", isCartFlow);
    console.log("CART ITEMS:", cart?.items?.length);

    // 4. Build final order items
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

    // 5. Validate stock for all items
    for (const item of finalOrderItems) {
      const product = await Product.findById(item.product);

      console.log("CHECKING PRODUCT:", item.product, "| FOUND:", !!product);
      if (product) {
        console.log("STOCK:", product.stock, "| REQUESTED:", item.quantity);
      }


      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
    }

    // 6. Resolve shipping address
    const finalShippingAddress = shippingAddress || {
      address: "Default Address",
      city: "Default City",
      postalCode: "000000",
      country: "India"
    };

    // 7. Resolve prices — always trust cart if cart flow, else use body values
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

    console.log("STOCK CHECK PASSED");
    console.log("FINAL ORDER ITEMS:", JSON.stringify(finalOrderItems));
    console.log("SHIPPING ADDRESS:", JSON.stringify(finalShippingAddress));
    console.log("ITEMS PRICE:", finalItemsPrice);
    console.log("SHIPPING PRICE:", finalShippingPrice);

    // 8. Create order
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

    // 9. Deduct stock
    for (const item of finalOrderItems) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    // 10. Clear cart only if cart flow
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