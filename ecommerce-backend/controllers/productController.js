import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
   /*
  GET /api/products
  Optional: ?search=shoes or ?search=kitchen or ....
*/
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
}