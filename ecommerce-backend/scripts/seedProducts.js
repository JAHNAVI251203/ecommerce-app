import mongoose from "mongoose";
import Product from "../models/Product.js";
import { defaultProducts } from "../defaultData/defaultProducts.js";
import dotenv from "dotenv";

dotenv.config();

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    await Product.deleteMany({}); 

    await Product.insertMany(defaultProducts);

    console.log("Products inserted successfully!!");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedProducts();