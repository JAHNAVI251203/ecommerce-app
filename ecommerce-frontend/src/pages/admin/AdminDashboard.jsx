import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    revenue: 0
  });

  const [sales, setSales] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {

      const statsRes = await API.get("/admin/dashboard");
      const salesRes = await API.get("/admin/sales");

      setStats(statsRes.data);
      setSales(salesRes.data);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="admin-dashboard">

      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats.orders}</p>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₹{stats.revenue}</p>
        </div>

      </div>

      <h2 className="sales-title">Monthly Sales</h2>

      <div className="sales-list">

        {sales.map((item) => (
          <div key={item._id} className="sales-row">

            <span>Month: {item._id}</span>
            <span>Orders: {item.totalOrders}</span>
            <span>Revenue: ₹{item.totalSales}</span>

          </div>
        ))}

      </div>

    </div>
  );
}