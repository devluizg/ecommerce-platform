const mysql = require('mysql2/promise');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para testar conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com banco de dados estabelecida');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com banco de dados:', error.message);
    return false;
  }
}

// Função para executar queries
async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
}

// Função para executar transações
async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Função para busca paginada
async function executeQueryWithPagination(query, params = [], page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    
    // Query para contar total de registros
    const countQuery = query.replace(/SELECT.*?FROM/i, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;
    
    // Query com paginação
    const paginatedQuery = `${query} LIMIT ? OFFSET ?`;
    const [rows] = await pool.execute(paginatedQuery, [...params, limit, offset]);
    
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Erro na query paginada:', error);
    throw error;
  }
}

module.exports = {
  pool,
  executeQuery,
  executeTransaction,
  executeQueryWithPagination,
  testConnection
};