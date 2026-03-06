import API from "./api/axios";
import { Routes, Route } from "react-router";
import { useState, useEffect } from "react";
import { HomePage } from "./pages/home/HomePage";
import { CheckoutPage } from "./pages/checkout/CheckoutPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { TrackingPage } from "./pages/tracking/TrackingPage";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

function App() {
  const [cart, setCart] = useState([]);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
        return;
      }

      const response = await API.get("/cart");

      const cartItems = response.data.items || response.data;

      setCart(cartItems);

    } catch (err) {
      console.log("Cart load failed");
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <Routes>
      <Route
        index
        element={<HomePage cart={cart} loadCart={loadCart} />}
      />

      <Route
        path="checkout"
        element={<CheckoutPage cart={cart} loadCart={loadCart} />}
      />

      <Route
        path="orders"
        element={<OrdersPage cart={cart} />}
      />

      <Route
        path="/tracking/:orderId"
        element={<TrackingPage cart={cart} />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />
    </Routes>
  );
}

export default App;