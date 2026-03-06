import { Header } from '../../components/Header';
import './TrackingPage.css';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../api/axios";
import { Link } from "react-router-dom";

export function TrackingPage({ cart }) {

  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) {
    return <div>Loading order...</div>;
  }

  const status = order.status;
  const item = order.orderItems[0];

  const getProgressWidth = () => {
    if (status === "created") return "20%";
    if (status === "processing") return "40%";
    if (status === "shipped") return "70%";
    if (status === "delivered") return "100%";
    if (status === "cancelled") return "100%";
    return "10%";
  };

  return (
    <>
      <title>Tracking</title>

      <Header cart={cart} />

      <div className="tracking-page">
        <div className="order-tracking">

          <Link className="back-to-orders-link link-primary" to="/orders">
            View all orders
          </Link>

          <div className="delivery-date">
            Arriving on {new Date(order.createdAt).toDateString()}
          </div>

          <div className="product-info">
            {item.product.name}
          </div>

          <div className="product-info">
            Quantity: {item.quantity}
          </div>

          <img
            className="product-image"
            src={item.product.image}
          />

          <div className="progress-labels-container">
            <div className={`progress-label ${status === "created" ? "current-status" : ""}`}>
              Created
            </div>
            <div className={`progress-label ${status === "processing" ? "current-status" : ""}`}>
              Preparing
            </div>
            <div className={`progress-label ${status === "shipped" ? "current-status" : ""}`}>
              Shipped
            </div>
            <div className={`progress-label ${status === "delivered" ? "current-status" : ""}`}>
              Delivered
            </div>
            <div className={`progress-label ${status === "cancelled" ? "current-status" : ""}`}>
              Cancelled
            </div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: getProgressWidth() }}
            ></div>
          </div>

        </div>
      </div>
    </>
  );
}