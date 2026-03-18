import Order from "../models/Order.js";
import User from "../models/User.js";


// PHASE 5 — ADMIN DASHBOARD
export const getDashboardStats = async (req, res) => {
  try {

    // total users
    const users = await User.countDocuments();

    // total orders
    const orders = await Order.countDocuments();

    // total revenue (only paid orders)
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



// PHASE 6 — MONTHLY SALES ANALYTICS
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