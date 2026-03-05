import express from 'express';
import DeliveryOption from '../models/DeliveryOption.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const expand = req.query.expand;

    const deliveryOptions = await DeliveryOption.find();
    let response = deliveryOptions;

    if (expand === 'estimatedDeliveryTime') {
      response = deliveryOptions.map(option => {
        const deliveryTimeMs =
          Date.now() + option.deliveryDays * 24 * 60 * 60 * 1000;

        return {
          ...option.toObject(),
          estimatedDeliveryTimeMs: deliveryTimeMs
        };
      });
    }

    res.json(response);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;