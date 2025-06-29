import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>E-Shop</h3>
            <p>Sua loja online de confiança</p>
          </div>
          
          <div className="footer-section">
            <h4>Links Rápidos</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Produtos</Link></li>
              <li><Link to="/cart">Carrinho</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contato</h4>
            <p>Email: contato@eshop.com</p>
            <p>Telefone: (11) 9999-9999</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 E-Shop. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;