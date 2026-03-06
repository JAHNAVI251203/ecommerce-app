import API from "../../api/axios";
import { useState } from "react";
import { formatMoney } from "../../utils/money";

export function Product({ product, loadCart }) {
  const [quantity, setQuantity] = useState(1);

  const addToCart = async () => {
    try {
      await API.post("/cart-items", {
        productId: product._id,
        quantity: quantity
      });

      await loadCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const selectQuantity = (event) => {
    const quantitySelected = Number(event.target.value);
    setQuantity(quantitySelected);
  };

  return (
    <div className="product-container" data-testid="product-container">
      <div className="product-image-container">
        <img
          className="product-image"
          data-testid="product-image"
          src={product.image}
          alt={product.name}
        />
      </div>

      <div className="product-name limit-text-to-2-lines">
        {product.name}
      </div>

      <div className="product-rating-container">
        <img
          className="product-rating-stars"
          data-testid="product-rating-stars-image"
          src={`images/ratings/rating-${(product.rating?.stars || 0) * 10}.png`}
          alt="rating"
        />

        <div className="product-rating-count link-primary">
          {product.rating?.count || 0}
        </div>
      </div>

      <div className="product-price">
        {formatMoney(product.priceCents / 100)}
      </div>

      <div className="product-quantity-container">
        <select value={quantity} onChange={selectQuantity}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

      <div className="product-spacer"></div>

      <div className="added-to-cart">
        <img src="images/icons/checkmark.png" alt="added" />
        Added
      </div>

      <button
        className="add-to-cart-button button-primary"
        data-testid="add-to-cart-button"
        onClick={addToCart}
      >
        Add to Cart
      </button>
    </div>
  );
}