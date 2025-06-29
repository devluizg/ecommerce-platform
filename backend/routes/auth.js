const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { executeQuery } = require('../config/database');
const { sendWelcomeEmail } = require('../utils/email');

const router = express.Router();

// Esquemas de validação
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipcode: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Registrar usuário
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details[0].message
      });
    }

    const { name, email, password, phone, address, city, state, zipcode } = value;

    // Verificar se usuário já existe
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Inserir usuário
    const result = await executeQuery(
      `INSERT INTO users (name, email, password, phone, address, city, state, zipcode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, address, city, state, zipcode]
    );

    // Buscar usuário criado
    const newUser = await executeQuery(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    // Gerar token
    const token = jwt.sign(
      { id: newUser[0].id, email: newUser[0].email, role: newUser[0].role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Enviar email de boas-vindas (não bloquear resposta)
    sendWelcomeEmail(email, name).catch(err => 
      console.error('Erro ao enviar email de boas-vindas:', err)
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: newUser[0],
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details[0].message
      });
    }

    const { email, password } = value;

    // Buscar usuário
    const users = await executeQuery(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    const user = users[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Remover senha da resposta
    delete user.password;

    res.json({
      message: 'Login realizado com sucesso',
      user,
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Buscar usuário atualizado
    const users = await executeQuery(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      valid: true,
      user: users[0]
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Gerar novo token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token: newToken
    });

  } catch (error) {
    console.error('Erro no refresh token:', error);
    res.status(401).json({
      error: 'Token inválido'
    });
  }
});

module.exports = router;