import razorpay from "../config/razorpay.js";
import Cart from "../models/Cart.js";
import crypto from "crypto";
import Order from "../models/Order.js";

export const createRazorpayOrder = async (req, res) => {
    try {

        const cart = await Cart.findOne({ user: req.user._id })
            .populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart empty" });
        }

        // calculate items total (paise)
        let itemsPrice = 0;

        cart.items.forEach(item => {
            itemsPrice += item.product.price * item.quantity;
        });

        // simple shipping rule
        let shippingPrice = itemsPrice > 50000 ? 0 : 500;

        const totalPrice = itemsPrice + shippingPrice;

        const options = {
            amount: totalPrice,
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
        res.status(500).json({ error: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

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

        // get cart again
        const cart = await Cart.findOne({ user: req.user._id })
            .populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart empty" });
        }

        // convert cart → orderItems
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }));

        // calculate total
        let itemsPrice = 0;

        cart.items.forEach(item => {
            itemsPrice += item.product.price * item.quantity;
        });

        const shippingPrice = itemsPrice > 50000 ? 0 : 500;

        const totalPrice = itemsPrice + shippingPrice;

        // create order
        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress: req.body.shippingAddress,
            paymentStatus: "paid",
            orderStatus: "placed",
            totalPrice,
            timeline: [
                {
                    status: "placed",
                    date: new Date()
                }
            ]
        });

        // clear cart
        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            order
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

