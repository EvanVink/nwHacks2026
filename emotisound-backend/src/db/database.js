const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../emotisound.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // User preferences table
    db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      userId TEXT PRIMARY KEY,
      volume REAL DEFAULT 0.5,
      sensitivity REAL DEFAULT 0.7,
      audioEnabled BOOLEAN DEFAULT 1,
      cameraEnabled BOOLEAN DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

    // Emotion events table
    db.run(`
    CREATE TABLE IF NOT EXISTS emotion_events (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      emotion TEXT NOT NULL,
      confidence REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

    // Sessions table
    db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      endedAt DATETIME,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
});

// Utility functions for database operations
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const getQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const allQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    db,
    runQuery,
    getQuery,
    allQuery,
};
