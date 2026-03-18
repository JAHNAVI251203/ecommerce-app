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
    totalPrice,
    orderItems,
    shippingAddress
  } = paymentSummary;

  const handlePlaceOrder = async () => {

    try {

      // 1️⃣ create razorpay order (backend calculates amount)
      const { data } = await API.post("/payments/create-order", {
        shippingPrice: paymentSummary.shippingPrice,
        itemsPrice: paymentSummary.itemsPrice,
        orderItems: paymentSummary.orderItems
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Your Store",
        description: "Order Payment",
        handler: async function (response) {

          try {

            console.log("VERIFY PAYLOAD:", {
              orderItems: paymentSummary.orderItems,
              shippingAddress: paymentSummary.shippingAddress
            });

            console.log("SENDING TO BACKEND:", {
              shippingPrice,
              itemsPrice,
              orderItems,
              shippingAddress
            });

            const verifyRes = await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingPrice,
              orderItems,
              shippingAddress: { ...shippingAddress },
              itemsPrice
            });

            // backend already created order
            const order = verifyRes.data.order;

            // clear cart
            await loadCart();

            // redirect
            navigate(`/tracking/${order._id}`);

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