import express from "express";
import Cart from "../models/Cart.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* GET CART */
router.get("/", protect, async (req, res) => {
  try {

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
      await cart.save();
    }

    res.json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* ADD ITEM TO CART */
router.post("/", protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity
      });
    }

    await cart.save();

    res.json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* REMOVE ITEM */
router.delete("/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    res.json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;