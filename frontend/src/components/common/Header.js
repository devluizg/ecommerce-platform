import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h2>E-Shop</h2>
        </Link>
        
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/products">Produtos</Link>
        </nav>
        
        <div className="header-actions">
          <Link to="/cart" className="cart-link">
            <FiShoppingCart />
            {getTotalItems() > 0 && (
              <span className="cart-count">{getTotalItems()}</span>
            )}
          </Link>
          
          {user ? (
            <div className="user-menu">
              <span>Olá, {user.name}</span>
              <button onClick={handleLogout}>Sair</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Cadastro</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;