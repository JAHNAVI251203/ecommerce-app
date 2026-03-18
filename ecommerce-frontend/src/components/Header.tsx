import { Link, useNavigate } from "react-router-dom";
import "./header.css";

type CartItem = {
  productId: string;
  quantity: number;
  deliveryOptionId: string;
};

type HeaderProps = {
  cart?: CartItem[];
};

export function Header({ cart = [] }: HeaderProps) {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // simple admin detection
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isAdmin = payload.role === "admin";
    } catch (err) {
      isAdmin = false;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const totalQuantity = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <div className="header">

      <div className="left-section">
        <Link to="/" className="header-link">
          <img className="logo" src="/images/logo-white.png" />
        </Link>
      </div>

      <div className="middle-section">
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
        />

        <button className="search-button">
          <img
            className="search-icon"
            src="/images/icons/search-icon.png"
          />
        </button>
      </div>

      <div className="right-section">

        <Link className="orders-link header-link" to="/orders">
          <span className="orders-text">Orders</span>
        </Link>

        {/* ADMIN DASHBOARD LINK */}
        {isAdmin && (
          <Link className="admin-link header-link" to="/admin/dashboard">
            <span className="orders-text">Dashboard</span>
          </Link>
        )}

        {!token ? (
          <Link className="orders-link header-link" to="/login">
            <span className="orders-text">Login</span>
          </Link>
        ) : (
          <div
            className="orders-link header-link"
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
          >
            <span className="orders-text">Logout</span>
          </div>
        )}

        <Link className="cart-link header-link" to="/checkout">
          <img
            className="cart-icon"
            src="/images/icons/cart-icon.png"
          />

          <div className="cart-quantity">
            {totalQuantity}
          </div>

          <div className="cart-text">
            Cart
          </div>
        </Link>

      </div>

    </div>
  );
}