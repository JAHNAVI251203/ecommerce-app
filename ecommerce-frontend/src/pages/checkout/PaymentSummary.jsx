import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { formatMoney } from "../../utils/money";

export function PaymentSummary({ paymentSummary, loadCart }) {
  const navigate = useNavigate();

  if (!paymentSummary) return null;

  const {
    totalItems,
    itemsPrice,
    shippingPrice,
    totalPrice,
    orderItems,
    shippingAddress
  } = paymentSummary;

  const handlePlaceOrder = async () => {
    try {
      const { data } = await API.post("/payments/create-order", {
        itemsPrice: Number(itemsPrice),
        shippingPrice: Number(shippingPrice)
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "ClickCart",
        description: "Order Payment",

        handler: async function (response) {
          try {
            const verifyRes = await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems,
              shippingAddress,
              itemsPrice: Number(itemsPrice),
              shippingPrice: Number(shippingPrice)
            });

            const order = verifyRes.data.order;

            await loadCart();

            navigate(`/tracking/${order._id}`);

          } catch (error) {
            console.error("Payment verification failed", error);
            alert("Payment verification failed. Please contact support.");
          }
        },

        prefill: {
          name: shippingAddress?.fullName || "",
          email: "",
          contact: shippingAddress?.phone || ""
        },

        theme: {
          color: "#3bb77e"
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Payment failed", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Unable to start payment. Please try again.");
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