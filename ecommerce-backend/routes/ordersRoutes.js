import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getTrackingStatus
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/", protect, getOrders);

router.get("/:id", protect, getOrderById);

router.put("/:id/status", protect, updateOrderStatus);

router.put("/:id/cancel", protect, cancelOrder);

router.get("/:id/tracking", protect, getTrackingStatus);

export default router;