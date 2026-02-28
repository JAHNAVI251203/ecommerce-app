import dayjs from 'dayjs';
import axios from 'axios';
import { formatMoney } from "../../utils/money";

export function DeliveryOptions({ cartItem, deliveryOptions, loadCart }) {
  return (
    <div className="delivery-options">
      <div className="delivery-options-title">
        Choose a delivery option:
      </div>
      {deliveryOptions.map((deliveryOption) => {
        let priceString = 'FREE Shipping';

        if (deliveryOption.priceCents > 0) {
          priceString = `${formatMoney(deliveryOption.priceCents)} - Shipping`;
        }

        // Add days based on index (0 = today+1, 1 = today+3, 2 = today+5)
        const daysToAdd = [5, 3, 1][deliveryOptions.indexOf(deliveryOption)] || 7;

        const deliveryDate = dayjs()
          .add(daysToAdd, 'day')
          .format('dddd, MMMM D');

        const updateDeliveryOption = async () => {
          await axios.put(`/api/cart-items/${cartItem.productId}`, {
            deliveryOptionId: deliveryOption.id
          });
          await loadCart();
        };

        return (
          <div key={deliveryOption.id} className="delivery-option" onClick={updateDeliveryOption}>
            <input
              type="radio"
              checked={deliveryOption.id === cartItem.deliveryOptionId}
              onChange={() => { }}
              className="delivery-option-input"
              name={`delivery-option-${cartItem.productId}`} />
            <div>
              <div className="delivery-option-date">
                {deliveryDate}
                {/* {dayjs(deliveryOption.estimatedDeliveryTimeMs).format('dddd, MMMM D')} */}
              </div>
              <div className="delivery-option-price">
                {priceString}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}