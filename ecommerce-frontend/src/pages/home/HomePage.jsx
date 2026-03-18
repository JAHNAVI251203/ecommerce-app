import API from "../../api/axios";
import { useEffect, useState } from 'react';
import { Header } from '../../components/Header';
import { ProductsGrid } from './ProductsGrid';
import './HomePage.css';

export function HomePage({ cart, loadCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getHomeData = async () => {
      try {
        const response = await API.get('/products');
        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    getHomeData();
  }, []);

  return (
    <>
      <title>E-commerce Project</title>

      <Header cart={cart} />

      <div className="home-page">
        <ProductsGrid products={products} loadCart={loadCart} />
      </div>
    </>
  );
}