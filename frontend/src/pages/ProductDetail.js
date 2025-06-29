import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        toast.error('Produto não encontrado');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <div className="loading">Carregando produto...</div>;
  }

  if (!product) {
    return <div className="error">Produto não encontrado</div>;
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Voltar
        </button>
        
        <div className="product-detail">
          <div className="product-image-section">
            <img 
              src={product.image_url || '/placeholder-image.jpg'} 
              alt={product.name}
              className="product-image"
            />
          </div>
          
          <div className="product-info-section">
            <h1>{product.name}</h1>
            
            <p className="product-price">
              R$ {product.price.toFixed(2)}
            </p>
            
            <p className="product-stock">
              {product.stock > 0 
                ? `${product.stock} unidades em estoque`
                : 'Produto indisponível'
              }
            </p>
            
            <div className="product-description">
              <h3>Descrição</h3>
              <p>{product.description || 'Sem descrição disponível'}</p>
            </div>
            
            {product.stock > 0 && (
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label>Quantidade:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button 
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="add-to-cart-btn"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;