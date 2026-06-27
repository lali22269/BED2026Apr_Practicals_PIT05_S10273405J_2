/**
 * Database Configuration - Microsoft SQL Server
 * Handles connection pooling and database operations
 */

const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

// Database configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // For Azure or local with SSL
        trustServerCertificate: true, // For local development
        enableArithAbort: true,
        requestTimeout: 30000,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
};

// Connection pool
let pool = null;

/**
 * Connect to SQL Server
 */
async function connectDB() {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('✅ Connected to Microsoft SQL Server');
            console.log(`📊 Database: ${process.env.DB_DATABASE}`);
        }
        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Please check your database configuration in .env file');
        process.exit(1);
    }
}

/**
 * Get connection pool
 */
async function getPool() {
    if (!pool) {
        await connectDB();
    }
    return pool;
}

/**
 * Execute a query with parameters
 */
async function executeQuery(query, params = {}) {
    try {
        const pool = await getPool();
        const request = pool.request();
        
        // Add parameters if provided
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });
        
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Query execution error:', error.message);
        throw error;
    }
}

/**
 * Execute a stored procedure
 */
async function executeStoredProcedure(procedureName, params = {}) {
    try {
        const pool = await getPool();
        const request = pool.request();
        
        // Add parameters if provided
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });
        
        const result = await request.execute(procedureName);
        return result.recordset;
    } catch (error) {
        console.error(`Stored procedure ${procedureName} error:`, error.message);
        throw error;
    }
}

/**
 * Close database connection
 */
async function closeDB() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Database connection closed');
        }
    } catch (error) {
        console.error('Error closing database connection:', error.message);
    }
}

module.exports = {
    connectDB,
    getPool,
    executeQuery,
    executeStoredProcedure,
    closeDB,
    sql
};