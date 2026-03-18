import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getCart,
  createCart,
  removeItem
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);

router.post("/", protect, createCart);

router.delete("/:productId", protect, removeItem);

export default router;