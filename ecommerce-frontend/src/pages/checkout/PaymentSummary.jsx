import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { formatMoney } from "../../utils/money";

export function PaymentSummary({ paymentSummary, loadCart }) {

  const navigate = useNavigate();

  if (!paymentSummary) {
    return null;
  }

  const {
    totalItems,
    itemsPrice,
    shippingPrice,
    totalPrice
  } = paymentSummary;

  const handlePlaceOrder = async () => {

    try {

      // 1️⃣ create razorpay order (backend calculates amount)
      const { data } = await API.post("/payments/create-order");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,

        name: "Your Store",
        description: "Order Payment",

        handler: async function (response) {

          try {

            // 2️⃣ verify payment
            await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // 3️⃣ create order in DB
            const shippingAddress = {
              address: "Default Address",
              city: "Default City",
              postalCode: "000000",
              country: "India"
            };

            const orderRes = await API.post("/orders", {
              shippingAddress
            });

            // 4️⃣ clear cart
            await loadCart();

            // 5️⃣ redirect to tracking page
            navigate(`/tracking/${orderRes.data._id}`);

          } catch (error) {

            console.error("Payment verification failed", error);
            alert("Payment verification failed");

          }

        },

        theme: {
          color: "#000000"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {

      console.error("Payment initiation failed:", error);
      alert("Unable to start payment");

    }

  };

  return (
    <div className="payment-summary">

      <div className="payment-summary-title">
        Payment Summary
      </div>

      <div className="payment-summary-row">
        <div>Items ({totalItems}):</div>
        <div className="payment-summary-money">
          {formatMoney(itemsPrice)}
        </div>
      </div>

      <div className="payment-summary-row">
        <div>Shipping & handling:</div>
        <div className="payment-summary-money">
          {formatMoney(shippingPrice)}
        </div>
      </div>

      <div className="payment-summary-row total-row">
        <div>Order total:</div>
        <div className="payment-summary-money">
          {formatMoney(totalPrice)}
        </div>
      </div>

      <button
        disabled={totalItems === 0}
        className="place-order-button"
        onClick={handlePlaceOrder}
      >
        Pay & Place Order
      </button>

    </div>
  );
}