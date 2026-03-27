import Order from "../models/Order.js";
import User from "../models/User.js";

//admin dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const users = await User.countDocuments();

    const orders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      {
        $match: { paymentStatus: "paid" }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    const revenue = revenueData.length > 0
      ? revenueData[0].totalRevenue
      : 0;

    res.json({
      users,
      orders,
      revenue
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//monthly sales 
export const getMonthlySales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $match: { paymentStatus: "paid" }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    res.json(sales);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};