import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/", protect, getOrders);

router.get("/:id", protect, getOrderById);

router.put("/:id/status", protect, updateOrderStatus);

router.put("/:id/cancel", protect, cancelOrder);

export default router;