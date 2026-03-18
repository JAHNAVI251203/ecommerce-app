import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  });

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },
    paymentResult: {
      razorpayOrderId: String,
      razorpayPaymentId: String
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"],
      default: "placed"
    },
    shippingPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    timeline: [
      {
        status: {
          type: String
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  });

const Order = mongoose.model("Order", orderSchema);

export default Order;