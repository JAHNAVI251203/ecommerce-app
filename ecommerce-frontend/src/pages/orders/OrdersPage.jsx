import API from "../../api/axios";
import dayjs from 'dayjs';
import { useState, useEffect, Fragment } from 'react';
import { formatMoney } from '../../utils/money';
import { Header } from '../../components/Header';
import './OrdersPage.css';


export function OrdersPage({ cart }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const getOrdersData = async () => {
      const response = await API.get('/orders');
      setOrders(response.data);
    };

    getOrdersData();
  }, []);

  return (
    <>
      <title>Orders</title>

      <Header cart={cart} />

      <div className="orders-page">
        <div className="page-title">Your Orders</div>

        <div className="orders-grid">
          {orders.map((order) => {
            return (
              <div key={order._id} className="order-container">

                <div className="order-header">
                  <div className="order-header-left-section">
                    <div className="order-date">
                      <div className="order-header-label">Order Placed:</div>
                      <div>{dayjs(order.createdAt).format('MMMM D')}</div>
                    </div>
                    <div className="order-total">
                      <div className="order-header-label">Total:</div>
                      <div>₹{order.totalPrice.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="order-header-right-section">
                    <div className="order-header-label">Order ID:</div>
                    <div>{order._id}</div>
                    <div>Status: {order.orderStatus}</div>
                  </div>
                </div>

                <div className="order-details-grid">
                  {order.orderItems.map((item) => {
                    if (!item.product) return null;
                    return (
                      <Fragment key={item.product._id}>
                        <div className="product-image-container">
                          <img src={item.product?.image} />
                        </div>

                        <div className="product-details">
                          <div className="product-name">
                            {item.product?.name}
                          </div>

                          <div className="product-quantity">
                            Quantity: {item.quantity}
                          </div>
                        </div>

                        <div className="product-actions">
                          <a href={`/tracking/${order._id}`}>
                            <button className="track-package-button button-secondary">
                              Track package
                            </button>
                          </a>
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}