const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const Joi = require('joi');

// Schema de validação para registro
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().optional()
});

// Schema de validação para login
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

class AuthController {
    // Registro de usuário
    async register(req, res) {
        try {
            // Validação dos dados
            const { error } = registerSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ 
                    success: false, 
                    message: error.details[0].message 
                });
            }

            const { name, email, password, phone } = req.body;

            // Verificar se o usuário já existe
            const [existingUser] = await db.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }

            // Criptografar a senha
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Inserir usuário no banco
            const [result] = await db.execute(
                'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, phone || null]
            );

            // Gerar token JWT
            const token = jwt.sign(
                { 
                    userId: result.insertId, 
                    email: email,
                    role: 'customer'
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: {
                    token,
                    user: {
                        id: result.insertId,
                        name,
                        email,
                        role: 'customer'
                    }
                }
            });

        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Login de usuário
    async login(req, res) {
        try {
            // Validação dos dados
            const { error } = loginSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const { email, password } = req.body;

            // Buscar usuário no banco
            const [users] = await db.execute(
                'SELECT id, name, email, password, role FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }

            const user = users[0];

            // Verificar senha
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }

            // Gerar token JWT
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Obter perfil do usuário
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;

            const [users] = await db.execute(
                'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                data: users[0]
            });

        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar perfil do usuário
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { name, phone } = req.body;

            // Validação básica
            if (!name || name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome deve ter pelo menos 2 caracteres'
                });
            }

            await db.execute(
                'UPDATE users SET name = ?, phone = ? WHERE id = ?',
                [name.trim(), phone || null, userId]
            );

            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso'
            });

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Alterar senha
    async changePassword(req, res) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            // Validação
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha atual e nova senha são obrigatórias'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Nova senha deve ter pelo menos 6 caracteres'
                });
            }

            // Buscar senha atual
            const [users] = await db.execute(
                'SELECT password FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar senha atual
            const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Senha atual incorreta'
                });
            }

            // Criptografar nova senha
            const hashedNewPassword = await bcrypt.hash(newPassword, 12);

            // Atualizar senha
            await db.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedNewPassword, userId]
            );

            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Logout (apenas resposta - token é gerenciado no frontend)
    async logout(req, res) {
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
}

module.exports = new AuthController();