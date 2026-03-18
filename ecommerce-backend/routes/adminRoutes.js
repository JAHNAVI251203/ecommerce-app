import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getMonthlySales
} from "../controllers/adminController.js";

const router = express.Router();

// GET /api/admin/dashboard
router.get("/dashboard", protect, admin, getDashboardStats);

// GET /api/admin/sales
router.get("/sales", protect, admin, getMonthlySales);

export default router;