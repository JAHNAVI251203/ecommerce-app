import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  /*GET /api/products  ; ?search=shoes or ?page=2*/
  try {
    const search = req.query.search;
    const page = Number(req.query.page) || 1;

    let filter = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i'); // case insensitive
      filter = {
        $or: [
          { name: searchRegex },
          { keywords: searchRegex }
        ]
      };
    }

    //count total products matching filter
    const count = await Product.countDocuments(filter);

    const products = await Product.find(filter);

    res.json({
      products,
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};