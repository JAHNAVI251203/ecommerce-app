import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import connectDB from './config/db.js';
import { fileURLToPath } from "url";
import fs from "fs";

//routes
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

//models
import Product from "./models/Product.js";
import DeliveryOption from "./models/DeliveryOption.js";
import Cart from "./models/Cart.js";
import CartItem from "./models/Cart.js";
import Order from "./models/Order.js";

//MongoDB Connection
connectDB();

//Express setup
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

//serve images
app.use("/images", express.static(path.join(__dirname, "images")));

//API routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

//seed DB(relational style)
const seedDatabase = async () => {
  const productCount = await Product.countDocuments();
  if (productCount > 0) return;

  console.log("Seeding database...");

  //insert products
  const createdProducts = await Product.insertMany(defaultProducts);

  //insert delivery options
  const createdDeliveryOptions = await DeliveryOption.insertMany(defaultDeliveryOptions);

  //creating cart items with product references
  const cartItems = defaultCart.map((item, index) => ({
    product: createdProducts[index % createdProducts.length]._id,
    quantity: item.quantity || 1
  }));

  await CartItem.insertMany(cartItems);

  //creating orders with proper references
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

//serving frontend(production build)
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "dist", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("index.html not found");
  }
});

//global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});