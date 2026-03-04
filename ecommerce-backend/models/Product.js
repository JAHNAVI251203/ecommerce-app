import mongoose from "mongoose";

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

export default mongoose.model("Product", productSchema);