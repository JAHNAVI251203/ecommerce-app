import { Header } from '../../components/Header';
import './TrackingPage.css';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../api/axios";
import { Link } from "react-router-dom";

export function TrackingPage({ cart }) {

  const statusStage = [
    "placed",
    "confirmed",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered"
  ];

  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${orderId}/tracking`);
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

  const currentStageIndex = statusStage.indexOf(order.orderStatus);

  const getProgressWidth = () => {
    return ((currentStageIndex + 1) / statusStage.length) * 100 + "%";
  };

  const getTimestamp = (status) => {
    const event = order.timeline.find((e) => e.status === status);
    return event ? new Date(event.date).toLocaleString() : null;
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

          {order.orderItems.map((item) => (
            <div key={item._id} className="tracking-product">

              <div className="product-info">
                {item.product?.name}
              </div>

              <div className="product-info">
                Quantity: {item.quantity}
              </div>

              <img
                className="product-image"
                src={item.product?.image}
                alt={item.product?.name}
              />

            </div>
          ))}

          <div className="progress-labels-container">
            {statusStage.map((step, index) => {

              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;

              const time = getTimestamp(step);

              return (
                <div key={step} className="progress-label">

                  <div
                    className={`step-status ${isCompleted ? "completed" : ""} ${isCurrent ? "current-status" : ""}`}
                  >
                    {step.replaceAll("_", " ")}
                  </div>

                  {time && (
                    <div className="step-time">
                      {time}
                    </div>
                  )}

                </div>
              );
            })}
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