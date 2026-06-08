import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'portfolio_builder',
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 10_000,
      timezone: '+00:00',
    });
  }
  return pool;
}

export interface DbUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string | null;
  google_id?: string | null;
  auth_provider?: 'local' | 'google';
  avatar_url?: string | null;
  role: 'user' | 'admin';
  is_premium: number;
  premium_purchased_at: Date | null;
  premium_portfolio_id: string | null;
  plan_id: number | null;
  created_at: Date;
}

export interface DbPayment {
  id: number;
  user_id: number;
  order_id: string;
  cf_order_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
}
