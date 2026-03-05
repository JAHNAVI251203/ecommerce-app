import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from './config/db.js';
import { fileURLToPath } from "url";
import fs from "fs";

// Routes
import productRoutes from "./routes/productsRoutes.js";
import deliveryOptionRoutes from "./routes/deliveryOptionsRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/ordersRoutes.js";
import resetRoutes from "./routes/reset.js";
import paymentSummaryRoutes from "./routes/paymentSummaryRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Models
import Product from "./models/Product.js";
import DeliveryOption from "./models/DeliveryOption.js";
import Cart from "./models/Cart.js";
import CartItem from "./models/Cart.js";
import Order from "./models/Order.js";

// Default Data
import { defaultProducts } from "./defaultData/defaultProducts.js";
import { defaultDeliveryOptions } from "./defaultData/defaultDeliveryOptions.js";
import { defaultCart } from "./defaultData/defaultCart.js";
import { defaultOrders } from "./defaultData/defaultOrders.js";

dotenv.config();
// MongoDB Connection
connectDB();

// Express Setup
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve images
app.use("/images", express.static(path.join(__dirname, "images")));

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/delivery-options", deliveryOptionRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reset", resetRoutes);
app.use("/api/payment-summary", paymentSummaryRoutes);
app.use("/api/users", userRoutes);

// Seed Database (Relational Style)
const seedDatabase = async () => {
  const productCount = await Product.countDocuments();
  if (productCount > 0) return;

  console.log("Seeding database...");

  // Insert Products
  const createdProducts = await Product.insertMany(defaultProducts);

  // Insert Delivery Options
  const createdDeliveryOptions = await DeliveryOption.insertMany(defaultDeliveryOptions);

  // Create Cart Items with Product references
  const cartItems = defaultCart.map((item, index) => ({
    product: createdProducts[index % createdProducts.length]._id,
    quantity: item.quantity || 1
  }));

  await CartItem.insertMany(cartItems);

  // Create Orders with proper references
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

  console.log("Database seeded successfully with relationships.");
};

await seedDatabase();

// Serve Frontend (Production Build)
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "dist", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("index.html not found");
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});