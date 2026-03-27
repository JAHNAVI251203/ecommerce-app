import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

//routes
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

//fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ecommerce-app-pearl-mu.vercel.app"
    ],
    credentials: true
  })
);
app.use(express.json());

//serve images
app.use("/images", express.static(path.join(__dirname, "images")));

//API routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminRoutes);

//serve frontend(production)
app.use(express.static(path.join(__dirname, "../ecommerce-frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../ecommerce-frontend/dist/index.html")
  );
});

//global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

//start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});