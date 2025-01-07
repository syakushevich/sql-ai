require('dotenv').config();
const { Pool } = require('pg');

// Create a PostgreSQL connection pool with credentials from environment variables
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Global array defining tables to query
const TABLES_TO_CHECK = ['users'];

// Generalized function to execute any SQL query
async function executeQuery(query, values = []) {
  try {
    console.log('Executing Query:', query);
    console.log('With Values:', values);

    const result = await pool.query(query, values);
    console.log('Query executed successfully:', result.rows);
    return result.rows; // Return the result rows
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  }
}

// Method to list columns for specified tables in simplified format, excluding "id"
async function listColumnsAndConstraints() {
  try {
    const placeholders = TABLES_TO_CHECK.map((_, index) => `$${index + 1}`).join(', ');
    const query = `
      SELECT
        c.table_name,
        c.column_name
      FROM information_schema.columns c
      WHERE c.table_name IN (${placeholders})
        AND c.column_name != 'id' -- Exclude the 'id' column
      ORDER BY c.table_name, c.ordinal_position;
    `;

    const result = await executeQuery(query, TABLES_TO_CHECK);

    // Simplify the result into table_name and column_names
    const simplifiedResult = result.reduce((acc, { table_name, column_name }) => {
      if (!acc[table_name]) {
        acc[table_name] = [];
      }
      acc[table_name].push(column_name);
      return acc;
    }, {});

    // Convert to an array format for easier processing
    const formattedResult = Object.entries(simplifiedResult).map(([table_name, column_names]) => ({
      table_name,
      column_names: column_names.join(', '),
    }));

    console.log('Simplified Columns Metadata (Excluding ID):', formattedResult);
    return formattedResult;
  } catch (err) {
    console.error('Error fetching columns and constraints:', err);
    throw err;
  }
}

module.exports = { executeQuery, listColumnsAndConstraints };
