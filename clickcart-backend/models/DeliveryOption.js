import mongoose from "mongoose";

const deliveryOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    priceCents: {
      type: Number,
      required: true
    },
    estimatedDays: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryOption", deliveryOptionSchema);