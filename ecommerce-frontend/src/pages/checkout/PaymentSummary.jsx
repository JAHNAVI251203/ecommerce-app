import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export function PaymentSummary({ paymentSummary, loadCart }) {

  const navigate = useNavigate();

  if (!paymentSummary) {
    return null;
  }

  const handlePlaceOrder = async () => {
    try {

      const shippingAddress = {
        address: "Default Address",
        city: "Default City",
        postalCode: "000000",
        country: "India"
      };

      await API.post("/orders", { shippingAddress });

      // reload cart so UI updates
      loadCart();

      // redirect to orders page
      navigate("/orders");

    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Failed to place order");
    }
  };

  return (
    <div className="payment-summary">

      <div className="payment-summary-title">
        Order Summary
      </div>

      <div className="payment-summary-row">
        <div>Items ({paymentSummary.totalItems}):</div>
        <div className="payment-summary-money">
          ${paymentSummary.itemsPrice.toFixed(2)}
        </div>
      </div>

      <div className="payment-summary-row">
        <div>Shipping & handling:</div>
        <div className="payment-summary-money">
          ${paymentSummary.shippingPrice.toFixed(2)}
        </div>
      </div>

      <div className="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div className="payment-summary-money">
          ${paymentSummary.totalBeforeTax.toFixed(2)}
        </div>
      </div>

      <div className="payment-summary-row">
        <div>Estimated tax (10%):</div>
        <div className="payment-summary-money">
          ${paymentSummary.taxPrice.toFixed(2)}
        </div>
      </div>

      <div className="payment-summary-row total-row">
        <div>Order total:</div>
        <div className="payment-summary-money">
          ${paymentSummary.totalPrice.toFixed(2)}
        </div>
      </div>

      <button
        className="place-order-button"
        onClick={handlePlaceOrder}
      >
        Place your order
      </button>

    </div>
  );
}