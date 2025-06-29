import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h2>Seu Carrinho</h2>
          <div className="empty-cart">
            <p>Seu carrinho está vazio.</p>
            <Link to="/products" className="continue-shopping">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h2>Seu Carrinho</h2>
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.image_url || '/placeholder-image.jpg'} 
                  alt={item.name}
                  className="item-image"
                />
                
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">R$ {item.price.toFixed(2)}</p>
                </div>
                
                <div className="item-quantity">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
                
                <div className="item-total">
                  <strong>R$ {(item.price * item.quantity).toFixed(2)}</strong>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3>Resumo do Pedido</h3>
              
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>R$ {getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="summary-line">
                <span>Frete:</span>
                <span>Grátis</span>
              </div>
              
              <div className="summary-line total-line">
                <strong>
                  <span>Total:</span>
                  <span>R$ {getTotalPrice().toFixed(2)}</span>
                </strong>
              </div>
              
              <div className="cart-actions">
                <button 
                  onClick={handleCheckout}
                  className="checkout-btn"
                >
                  Finalizar Compra
                </button>
                
                <button 
                  onClick={clearCart}
                  className="clear-cart-btn"
                >
                  Limpar Carrinho
                </button>
                
                <Link to="/products" className="continue-shopping">
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;