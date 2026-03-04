import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

/*
  GET /api/products
  Optional: ?search=shoes or ?search=kitchen or ....
*/
router.get('/', async (req, res) => {
  try {
    const search = req.query.search;

    let products;

    if (search) {
      const searchRegex = new RegExp(search, 'i'); //case insensitive

      products = await Product.find({
        $or: [
          { name: searchRegex },
          { keywords: searchRegex }
        ]
      });

    } else {
      products = await Product.find();
    }

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;