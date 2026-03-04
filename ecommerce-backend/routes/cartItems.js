import express from 'express';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import DeliveryOption from '../models/DeliveryOption.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const expand = req.query.expand;

    let cartItems = await CartItem.find();

    if (expand === 'product') {
      cartItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await Product.findById(item.productId);
          return {
            ...item.toObject(),
            product
          };
        })
      );
    }

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
    }

    // Check if cart item already exists
    let cartItem = await CartItem.findOne({ productId });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        productId,
        quantity,
        deliveryOptionId: "1" // default delivery option
      });
    }

    res.status(201).json(cartItem);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, deliveryOptionId } = req.body;

    const cartItem = await CartItem.findOne({ productId });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Update quantity
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be greater than 0' });
      }
      cartItem.quantity = quantity;
    }

    // Update delivery option
    if (deliveryOptionId !== undefined) {
      const deliveryOption = await DeliveryOption.findOne({ id: deliveryOptionId });

      if (!deliveryOption) {
        return res.status(400).json({ error: 'Invalid delivery option' });
      }

      cartItem.deliveryOptionId = deliveryOptionId;
    }

    await cartItem.save();

    res.json(cartItem);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const cartItem = await CartItem.findOne({ productId });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await CartItem.deleteOne({ productId });

    res.status(204).send();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;