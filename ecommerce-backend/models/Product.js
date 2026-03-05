import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true
});

const Product = mongoose.model("Product", productSchema);

export default Product;
/*import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      rate: { type: Number, required: true },
      count: { type: Number, required: true }
    },
    priceCents: {
      type: Number,
      required: true
    },
    keywords: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);*/