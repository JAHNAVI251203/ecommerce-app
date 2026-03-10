import API from "../../api/axios";
import { formatMoney } from "../../utils/money";
import { DeliveryOptions } from "./DeliveryOptions";

export function OrderSummary({
  cart,
  deliverySelection,
  setDeliverySelection,
  loadCart
}) {

  if (!cart || !cart.items) {
    return null;
  }

  const deleteCartItem = async (productId) => {
    try {
      await API.delete(`/cart/${productId}`);
      await loadCart();
    } catch (error) {
      console.error("Delete cart item failed:", error);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {

      if (quantity < 1) return;

      await API.post("/cart", {
        productId,
        quantity
      });

      await loadCart();

    } catch (error) {
      console.error("Update cart item failed:", error);
    }
  };

  return (
    <div className="order-summary">

      {cart.items.map((cartItem) => {

        const product = cartItem.product;

        if (!product) return null;

        return (
          <div
            key={product._id}
            className="cart-item-container"
          >

            <div className="cart-item-details-grid">

              <img
                className="product-image"
                src={product.image}
                alt={product.name}
              />

              <div className="cart-item-details">

                <div className="product-name">
                  {product.name}
                </div>

                <div className="product-price">
                  {formatMoney(product?.price ?? 0)}
                </div>

                <div className="product-quantity">

                  <span>
                    Quantity:
                    <span className="quantity-label">
                      {cartItem.quantity}
                    </span>
                  </span>

                  <span
                    className="update-quantity-link link-primary"
                    onClick={() =>
                      updateCartItem(
                        product._id,
                        cartItem.quantity + 1
                      )
                    }
                  >
                    Update
                  </span>

                  <span
                    className="delete-quantity-link link-primary"
                    onClick={() =>
                      deleteCartItem(product._id)
                    }
                  >
                    Delete
                  </span>

                </div>

              </div>

              <DeliveryOptions
                cartItem={cartItem}
                deliverySelection={deliverySelection}
                setDeliverySelection={setDeliverySelection}
              />

            </div>

          </div>
        );
      })}

    </div>
  );
}