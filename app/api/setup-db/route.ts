import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    // Database configuration without database name
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'bebz',
    };

    console.log('Connecting to MySQL server...');
    console.log('Config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password ? '[REDACTED]' : '(empty)'
    });

    // Create connection without database
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'sailstock';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);

    // Use the database
    await connection.query(`USE ${dbName}`);
    console.log(`Using database '${dbName}'`);

    // Drop tables if they exist
    await connection.query('DROP TABLE IF EXISTS sessions');
    await connection.query('DROP TABLE IF EXISTS users');
    console.log('Dropped existing tables');

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createUsersTable);
    console.log('Users table created');

    // Create sessions table
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createSessionsTable);
    console.log('Sessions table created');

    // Close connection
    await connection.end();
    console.log('Database setup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to set up database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
