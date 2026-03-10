import Cart from "../models/Cart.js";

export const getCart = async (req, res) => {
  try {

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price image");

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
}

export const createCart = async (req, res) => {
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
}

export const removeItem = async (req, res) => {
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
}

