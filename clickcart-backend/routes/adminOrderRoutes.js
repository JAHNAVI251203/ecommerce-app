import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatusAdmin
} from "../controllers/adminOrderController.js";

const router = express.Router();

router.get("/orders", protect, admin, getAllOrders);

router.get("/orders/:id", protect, admin, getOrderByIdAdmin);

router.put("/orders/:id/status", protect, admin, updateOrderStatusAdmin);

export default router;