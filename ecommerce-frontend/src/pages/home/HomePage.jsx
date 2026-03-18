import API from "../../api/axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../../components/Header";
import { ProductsGrid } from "./ProductsGrid";
import "./HomePage.css";

export function HomePage({ cart, loadCart }) {
  const [products, setProducts] = useState([]);
  const location = useLocation();

  // ✅ GET SEARCH FROM URL
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get("search") || "";

  useEffect(() => {
    const getHomeData = async () => {
      try {
        const response = await API.get(`/products?search=${search}`);
        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    getHomeData();
  }, [search]); // ✅ RE-RUN WHEN SEARCH CHANGES

  return (
    <>
      <title>E-commerce Project</title>

      <Header cart={cart} />

      <div className="home-page">
        {/* ✅ OPTIONAL: EMPTY STATE */}
        {products.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            No products found
          </p>
        ) : (
          <ProductsGrid products={products} loadCart={loadCart} />
        )}
      </div>
    </>
  );
} 