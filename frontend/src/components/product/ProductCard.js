import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img 
          src={product.image_url || '/placeholder-image.jpg'} 
          alt={product.name}
          className="product-image"
        />
      </Link>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">R$ {product.price.toFixed(2)}</p>
        <p className="product-stock">
          {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
        </p>
        
        <button 
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="add-to-cart-btn"
        >
          {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;