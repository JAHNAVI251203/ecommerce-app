import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import DeliveryOption from '../models/DeliveryOption.js';
import CartItem from '../models/CartItem.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const expand = req.query.expand;

    let orders = await Order.find().sort({ orderTimeMs: -1 });

    if (expand === 'products') {
      orders = await Promise.all(
        orders.map(async (order) => {
          const expandedProducts = await Promise.all(
            order.products.map(async (item) => {
              const productDetails = await Product.findById(item.productId);
              return {
                ...item,
                product: productDetails
              };
            })
          );

          return {
            ...order.toObject(),
            products: expandedProducts
          };
        })
      );
    }

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const cartItems = await CartItem.find();

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalCostCents = 0;

    const products = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const deliveryOption = await DeliveryOption.findById(item.deliveryOptionId);
        if (!deliveryOption) {
          throw new Error(`Invalid delivery option: ${item.deliveryOptionId}`);
        }

        const productCost = product.priceCents * item.quantity;
        const shippingCost = deliveryOption.priceCents;

        totalCostCents += productCost + shippingCost;

        const estimatedDeliveryTimeMs =
          Date.now() + deliveryOption.deliveryDays * 24 * 60 * 60 * 1000;

        return {
          productId: item.productId,
          quantity: item.quantity,
          estimatedDeliveryTimeMs
        };
      })
    );

    // Add 10% tax
    totalCostCents = Math.round(totalCostCents * 1.1);

    const order = await Order.create({
      orderTimeMs: Date.now(),
      totalCostCents,
      products
    });

    // Clear cart
    await CartItem.deleteMany({});

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const expand = req.query.expand;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (expand === 'products') {
      const expandedProducts = await Promise.all(
        order.products.map(async (item) => {
          const productDetails = await Product.findById(item.productId);
          return {
            ...item,
            product: productDetails
          };
        })
      );

      order = {
        ...order.toObject(),
        products: expandedProducts
      };
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;