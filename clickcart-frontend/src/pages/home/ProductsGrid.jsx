import { Product } from './Product';

export function ProductsGrid({ products, loadCart }) {
  return (
    <div className="products-grid">
      {products.map((product) => {
        return (
          <Product key={product._id} product={product} loadCart={loadCart} />
        );
      })}
    </div>
  );
}