import razorpay from "../config/razorpay.js";
import Cart from "../models/Cart.js";
import crypto from "crypto";
import Order from "../models/Order.js";


// ==============================
// CREATE ORDER
// ==============================
export const createRazorpayOrder = async (req, res) => {
  try {

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    const isCartFlow = cart && cart.items.length > 0;

    // ❗ allow admin fallback if no cart
    if (!isCartFlow && req.user.role !== "admin") {
      return res.status(400).json({ message: "Cart empty" });
    }

    // ==============================
    // PRICE CALCULATION
    // ==============================
    let itemsPrice = 0;

    if (isCartFlow) {
      cart.items.forEach(item => {
        itemsPrice += item.product.price * item.quantity;
      });
    } else {
      // admin fallback (from frontend)
      itemsPrice = Number(req.body.itemsPrice) || 0;
    }

    const shippingPrice = req.body.shippingPrice || 0;
    const totalPrice = itemsPrice + shippingPrice;

    const options = {
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      itemsPrice,
      shippingPrice
    });

  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ error: error.message });
  }
};



// ==============================
// VERIFY PAYMENT
// ==============================
export const verifyPayment = async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    // ==============================
    // SIGNATURE VERIFICATION
    // ==============================
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed"
      });
    }

    // ==============================
    // FETCH CART (OPTIONAL NOW)
    // ==============================
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    const isCartFlow = cart && cart.items.length > 0;

    console.log("BODY:", req.body);
    console.log("USER:", req.user);
    console.log("EXPECTED:", expectedSignature);
    console.log("RECEIVED:", razorpay_signature);

    console.log("---- VERIFY DEBUG ----");
    console.log("order_id:", razorpay_order_id);
    console.log("payment_id:", razorpay_payment_id);
    console.log("signature:", razorpay_signature);

    console.log("generated:", expectedSignature);

    // ==============================
    // STOCK CHECK (ONLY IF CART)
    // ==============================
    if (isCartFlow) {
      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          return res.status(400).json({
            message: `${item.product.name} out of stock`
          });
        }
      }
    }

    // ==============================
    // ORDER ITEMS
    // ==============================
    let orderItems = [];

    if (isCartFlow) {
      orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }));
    } else {
      // admin fallback
      orderItems = req.body.orderItems || [];
    }

    // ✅ ADD THIS RIGHT HERE
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    if (!req.body.shippingAddress) {
      return res.status(400).json({ message: "Missing shipping address" });
    }

    // ==============================
    // PRICE CALCULATION
    // ==============================
    let itemsPrice = 0;

    if (isCartFlow) {
      cart.items.forEach(item => {
        itemsPrice += item.product.price * item.quantity;
      });
    } else {
      itemsPrice = Number(req.body.itemsPrice) || 0;
    }

    const shippingPrice = req.body.shippingPrice || 0;
    const totalPrice = itemsPrice + shippingPrice;

    // ==============================
    // CREATE ORDER
    // ==============================
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      orderStatus: "placed",
      itemsPrice,
      shippingPrice,
      totalPrice,
      orderItems,
      shippingAddress,
      timeline: [
        {
          status: "placed",
          date: new Date()
        }
      ]
    });

    // ==============================
    // REDUCE STOCK (ONLY IF CART)
    // ==============================
    if (isCartFlow) {
      for (const item of cart.items) {
        item.product.stock -= item.quantity;
        await item.product.save();
      }
    }

    // ==============================
    // CLEAR CART (ONLY IF EXISTS)
    // ==============================
    if (isCartFlow) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: error.message });
  }
};