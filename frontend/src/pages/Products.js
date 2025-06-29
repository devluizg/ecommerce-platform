// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { mockProducts } from '../data/mockProducts';
import ProductCard from '../components/product/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        setProducts(response.data);
      } catch (error) {
        console.log('Backend indisponível, usando dados de demonstração');
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Carregando produtos...</div>;

  return (
    <div className="products-page">
      <div className="container">
        <h1>Todos os Produtos</h1>
        
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <p className="no-products">Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default Products;