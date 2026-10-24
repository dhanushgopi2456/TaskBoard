import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPostgres = !!process.env.DATABASE_URL;

let pgPool = null;
let sqliteDb = null;

if (isPostgres) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
} else {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbFile = process.env.NODE_ENV === 'test' 
    ? path.join(dataDir, 'test.db')
    : path.join(dataDir, 'tasks.db');
  sqliteDb = new Database(dbFile);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
}

export async function query(sql, params = []) {
  if (isPostgres) {
    // Translate SQLite '?' to Postgres '$1, $2, ...'
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  } else {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      return sqliteDb.prepare(sql).all(...params);
    } else {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return info;
    }
  }
}

export async function initDb() {
  if (isPostgres) {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'Medium',
        category VARCHAR(50) DEFAULT 'General',
        due_date VARCHAR(50),
        completed BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'todo',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS focus_sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id VARCHAR(64) REFERENCES tasks(id) ON DELETE SET NULL,
        duration_minutes INTEGER NOT NULL,
        mode VARCHAR(20) DEFAULT 'focus',
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure status and category columns exist in PostgreSQL
    try {
      await pgPool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'todo'`);
      await pgPool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General'`);
      await pgPool.query(`UPDATE tasks SET status = 'completed' WHERE completed = TRUE AND (status IS NULL OR status = 'todo')`);
    } catch {
      // Ignore if already configured
    }
  } else {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'Medium',
        category TEXT DEFAULT 'General',
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        status TEXT DEFAULT 'todo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        duration_minutes INTEGER NOT NULL,
        mode TEXT DEFAULT 'focus',
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure status and category columns exist in SQLite
    try {
      const tableInfo = sqliteDb.pragma('table_info(tasks)');
      const hasStatus = tableInfo.some(col => col.name === 'status');
      if (!hasStatus) {
        sqliteDb.exec(`ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'todo'`);
      }
      const hasCategory = tableInfo.some(col => col.name === 'category');
      if (!hasCategory) {
        sqliteDb.exec(`ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'General'`);
      }
      sqliteDb.exec(`UPDATE tasks SET status = 'completed' WHERE completed = 1 AND (status IS NULL OR status = 'todo')`);
      sqliteDb.exec(`UPDATE tasks SET status = 'todo' WHERE (completed = 0 OR completed IS NULL) AND (status IS NULL OR status = '')`);
      sqliteDb.exec(`UPDATE tasks SET category = 'General' WHERE category IS NULL OR category = ''`);
    } catch {
      // Ignore
    }
  }

  // Seed demo user demo@taskboard.com / Demo@123 if not exists
  await seedDemoUser();
}

async function seedDemoUser() {
  try {
    const demoEmail = 'demo@taskboard.com';
    let existing;
    if (isPostgres) {
      const res = await pgPool.query('SELECT * FROM users WHERE email = $1', [demoEmail]);
      existing = res.rows[0];
    } else {
      existing = sqliteDb.prepare('SELECT * FROM users WHERE email = ?').get(demoEmail);
    }

    if (!existing) {
      const demoId = 'user-demo-001';
      const hashedPassword = await bcrypt.hash('Demo@123', 10);
      const userName = 'Priya';

      if (isPostgres) {
        await pgPool.query(
          'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
          [demoId, userName, demoEmail, hashedPassword]
        );
      } else {
        sqliteDb.prepare(
          'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)'
        ).run(demoId, userName, demoEmail, hashedPassword);
      }

      // Sample tasks from the assignment mockup
      const sampleTasks = [
        {
          id: 'task-demo-1',
          userId: demoId,
          title: 'Prepare client demo slides',
          description: 'Finalize the 10-slide pitch deck for Tuesday meeting with leadership',
          priority: 'High',
          dueDate: '2026-10-24',
          completed: isPostgres ? false : 0,
          status: 'todo'
        },
        {
          id: 'task-demo-2',
          userId: demoId,
          title: 'Pay electricity bill',
          description: 'Online payment via state power distribution portal before late fine',
          priority: 'Medium',
          dueDate: '2026-10-20',
          completed: isPostgres ? false : 0,
          status: 'in_progress'
        },
        {
          id: 'task-demo-3',
          userId: demoId,
          title: 'Book dentist appointment',
          description: 'Routine 6-month cleaning and dental checkup',
          priority: 'Low',
          dueDate: '2026-10-30',
          completed: isPostgres ? false : 0,
          status: 'todo'
        },
        {
          id: 'task-demo-4',
          userId: demoId,
          title: 'Send weekly report',
          description: 'Compile sprint summary metrics and send email to engineering leads',
          priority: 'Medium',
          dueDate: '2026-10-21',
          completed: isPostgres ? true : 1,
          status: 'completed'
        }
      ];

      for (const t of sampleTasks) {
        if (isPostgres) {
          await pgPool.query(
            `INSERT INTO tasks (id, user_id, title, description, priority, due_date, completed, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [t.id, t.userId, t.title, t.description, t.priority, t.dueDate, t.completed, t.status]
          );
        } else {
          sqliteDb.prepare(
            `INSERT INTO tasks (id, user_id, title, description, priority, due_date, completed, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(t.id, t.userId, t.title, t.description, t.priority, t.dueDate, t.completed, t.status);
        }
      }
      console.log('✅ Demo user (demo@taskboard.com / Demo@123) and sample tasks successfully seeded');
    }
  } catch (err) {
    console.error('Error during demo user seed:', err);
  }
}

export { isPostgres, pgPool, sqliteDb };

