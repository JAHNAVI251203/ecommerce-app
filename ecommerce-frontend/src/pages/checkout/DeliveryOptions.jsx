import dayjs from "dayjs";
import { formatMoney } from "../../utils/money";

export function DeliveryOptions({ cartItem, deliverySelection, setDeliverySelection }) {

  const options = [
    { id: "free", price: 0, days: 5 },
    { id: "standard", price: 5, days: 3 },   // ₹5
    { id: "express", price: 10, days: 1 }    // ₹10
  ];

  const selected =
    deliverySelection[cartItem.product._id] || "free";

  const handleChange = (optionId) => {
    setDeliverySelection(prev => ({
      ...prev,
      [cartItem.product._id]: optionId
    }));
  };

  return (
    <div className="delivery-options">

      <div className="delivery-options-title">
        Choose a delivery option:
      </div>

      {options.map(option => {

        const deliveryDate = dayjs()
          .add(option.days, "day")
          .format("dddd, MMMM D");

        const priceText =
          option.price === 0
            ? "FREE Shipping"
            : `${formatMoney(option.price)} - Shipping`;

        return (
          <label key={option.id} className="delivery-option">

            <input
              type="radio"
              checked={selected === option.id}
              onChange={() => handleChange(option.id)}
              name={`delivery-${cartItem.product._id}`}
            />

            <div>
              <div className="delivery-option-date">
                {deliveryDate}
              </div>

              <div className="delivery-option-price">
                {priceText}
              </div>
            </div>

          </label>
        );
      })}
    </div>
  );
}