import express from 'express';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import DeliveryOption from '../models/DeliveryOption.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cartItems = await CartItem.find();

    let totalItems = 0;
    let productCostCents = 0;
    let shippingCostCents = 0;

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const deliveryOption = await DeliveryOption.findById(item.deliveryOptionId);
      if (!deliveryOption) continue;

      totalItems += item.quantity;
      productCostCents += product.priceCents * item.quantity;
      shippingCostCents += deliveryOption.priceCents;
    }

    const totalCostBeforeTaxCents = productCostCents + shippingCostCents;
    const taxCents = Math.round(totalCostBeforeTaxCents * 0.1);
    const totalCostCents = totalCostBeforeTaxCents + taxCents;

    res.json({
      totalItems,
      productCostCents,
      shippingCostCents,
      totalCostBeforeTaxCents,
      taxCents,
      totalCostCents
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;