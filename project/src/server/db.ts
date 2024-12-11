import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '../../database.sqlite'), {
  verbose: console.log,
  fileMustExist: false,
});

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Initialize database with tables and indexes
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    google_id TEXT UNIQUE,
    picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

  CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    image_url TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    author_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
  CREATE INDEX IF NOT EXISTS idx_notices_date ON notices(date);
  CREATE INDEX IF NOT EXISTS idx_notices_author ON notices(author_id);

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    category TEXT NOT NULL,
    feedback TEXT NOT NULL,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
  CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    type TEXT CHECK (type IN ('task', 'event')),
    creator_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    notice_id TEXT NOT NULL,
    user_id TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notice_id) REFERENCES notices (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_comments_notice ON comments(notice_id);
`);

// Create prepared statements for common operations
const preparedStatements = {
  insertUser: db.prepare(`
    INSERT INTO users (id, email, password, name, role, google_id, picture)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  insertNotice: db.prepare(`
    INSERT INTO notices (id, title, content, category, priority, image_url, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  insertFeedback: db.prepare(`
    INSERT INTO feedback (id, rating, category, feedback, user_id)
    VALUES (?, ?, ?, ?, ?)
  `),
  
  insertEvent: db.prepare(`
    INSERT INTO events (id, title, description, date, type, creator_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  
  getNoticesByCategory: db.prepare(`
    SELECT n.*, u.name as author_name
    FROM notices n
    JOIN users u ON n.author_id = u.id
    WHERE n.category = ?
    ORDER BY n.created_at DESC
  `),
  
  getFeedbackStats: db.prepare(`
    SELECT 
      category,
      COUNT(*) as count,
      AVG(rating) as avg_rating
    FROM feedback
    GROUP BY category
  `),
};

export { db, preparedStatements };