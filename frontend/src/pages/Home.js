// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { mockProducts } from '../data/mockProducts';
import ProductCard from '../components/product/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Tentar buscar do backend primeiro
        const response = await productsAPI.getAll();
        setProducts(response.data.slice(0, 6));
      } catch (error) {
        // Se falhar, usar dados mockados
        console.log('Backend indisponível, usando dados de demonstração');
        setProducts(mockProducts.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="home">
      <section className="hero">
        <div className="container text-center">
          <h1>Bem-vindo à E-Shop</h1>
          <p>Os melhores produtos com os melhores preços</p>
          
          <ul className="benefits-list">
            <li>🛒 Frete grátis a partir de R$ 199</li>
            <li>🔐 Compra segura</li>
            <li>🚚 Entrega rápida</li>
          </ul>
        </div>
      </section>
      
      <section className="featured-products">
        <div className="container">
          <h2>Produtos em Destaque</h2>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
