import express from "express";

import Product from "../models/Product.js";
import DeliveryOption from "../models/DeliveryOption.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

import { defaultProducts } from "../defaultData/defaultProducts.js";
import { defaultDeliveryOptions } from "../defaultData/defaultDeliveryOptions.js";
import { defaultCart } from "../defaultData/defaultCart.js";
import { defaultOrders } from "../defaultData/defaultOrders.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    //Clear all collections
    await Product.deleteMany({});
    await DeliveryOption.deleteMany({});
    await CartItem.deleteMany({});
    await Order.deleteMany({});

    //Insert Products
    const createdProducts = await Product.insertMany(defaultProducts);

    //Insert Delivery Options
    const createdDeliveryOptions = await DeliveryOption.insertMany(defaultDeliveryOptions);

    // Insert Cart Items (with references)
    const cartItems = defaultCart.map((item, index) => ({
      product: createdProducts[index % createdProducts.length]._id,
      quantity: item.quantity || 1
    }));

    await CartItem.insertMany(cartItems);

    //Insert Orders (with references)
    const orders = defaultOrders.map((order, index) => ({
      items: [
        {
          product: createdProducts[index % createdProducts.length]._id,
          quantity: 1
        }
      ],
      deliveryOption: createdDeliveryOptions[0]._id,
      totalAmountCents:
        createdProducts[index % createdProducts.length].priceCents,
      status: "pending"
    }));

    await Order.insertMany(orders);

    res.status(200).json({ message: "Database reset and reseeded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Reset failed" });
  }
});

export default router;