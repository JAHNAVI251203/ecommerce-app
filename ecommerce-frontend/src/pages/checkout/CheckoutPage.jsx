import API from "../../api/axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OrderSummary } from "./OrderSummary";
import { PaymentSummary } from "./PaymentSummary";
import "./checkout-header.css";
import "./CheckoutPage.css";

export function CheckoutPage({ loadCart }) {

  const [cart, setCart] = useState(null);
  const [deliverySelection, setDeliverySelection] = useState({});

  const navigate = useNavigate();

  // Fetch cart once when page loads
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await API.get("/cart");
        setCart(res.data);
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    fetchCart();

  }, [navigate]);



  // Set default delivery options AFTER cart loads
  useEffect(() => {

    if (!cart || !cart.items) return;

    const defaults = {};

    cart.items.forEach(item => {
      defaults[item.product._id] = "free";
    });

    setDeliverySelection(defaults);

  }, [cart]);


  if (!cart) {
    return <div>Loading checkout...</div>;
  }


  // ------------------------------------------------
  // Checkout Calculations (ALL IN PAISE)
  // ------------------------------------------------

  let itemsPrice = 0;
  let shippingPrice = 0;
  let totalItems = 0;

  cart.items.forEach((item) => {

    const price = item.product?.price || 0;
    const qty = item.quantity || 0;

    itemsPrice += price * qty;
    totalItems += qty;

    const selectedDelivery = deliverySelection[item.product._id] || "free";

    if (selectedDelivery === "standard") shippingPrice += 500;
    if (selectedDelivery === "express") shippingPrice += 1000;

  });

  const totalPrice = itemsPrice + shippingPrice;

  const paymentSummary = {
    totalItems,
    itemsPrice,
    shippingPrice,
    totalPrice
  };



  return (
    <>
      <title>Checkout</title>

      <div className="checkout-header">
        <div className="header-content">

          <div className="checkout-header-left-section">
            <a href="/">
              <img className="logo" src="/images/logo.png" />
              <img className="mobile-logo" src="/images/mobile-logo.png" />
            </a>
          </div>

          <div className="checkout-header-middle-section">
            Checkout (
            <a className="return-to-home-link" href="/">
              {totalItems} items
            </a>
            )
          </div>

          <div className="checkout-header-right-section">
            <img src="/images/icons/checkout-lock-icon.png" />
          </div>

        </div>
      </div>


      <div className="checkout-page">

        <div className="page-title">
          Review your order
        </div>

        <div className="checkout-grid">

          <OrderSummary
            cart={cart}
            deliverySelection={deliverySelection}
            setDeliverySelection={setDeliverySelection}
            loadCart={loadCart}
          />

          <PaymentSummary
            paymentSummary={paymentSummary}
            loadCart={loadCart}
          />

        </div>

      </div>
    </>
  );
}