---
title: "SQLite Database Management and Optimization"
summary: "Learn advanced SQLite database management techniques, optimization strategies, and best practices for mobile and embedded applications"
date: "2025, 05, 20"
draft: false
tags:
  - SQLite
---

# SQLite Database Management and Optimization

SQLite is a lightweight, serverless, and self-contained database engine that's perfect for mobile and embedded applications. This guide covers advanced database management techniques, optimization strategies, and best practices for building efficient applications.

## Database Design

### 1. Table Design

```sql
-- Create table with proper constraints
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Create table with foreign key
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create composite index
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
```

### 2. Data Types and Constraints

```sql
-- Use appropriate data types
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category TEXT CHECK (category IN ('electronics', 'clothing', 'books')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint
CREATE UNIQUE INDEX idx_products_name ON products(name);
```

## Performance Optimization

### 1. Indexing Strategies

```sql
-- Create partial index
CREATE INDEX idx_active_users ON users(email) WHERE is_active = 1;

-- Create covering index
CREATE INDEX idx_posts_cover ON posts(user_id, title, created_at);

-- Create expression index
CREATE INDEX idx_users_name_lower ON users(LOWER(name));
```

### 2. Query Optimization

```sql
-- Use EXPLAIN QUERY PLAN
EXPLAIN QUERY PLAN
SELECT u.username, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id
WHERE u.created_at > datetime('now', '-7 days');

-- Optimize JOIN queries
SELECT u.username, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id
HAVING post_count > 0;

-- Use prepared statements
INSERT INTO users (email, username, password_hash)
VALUES (?, ?, ?);
```

## Advanced Features

### 1. Full-Text Search

```sql
-- Create virtual table for FTS
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title,
    content,
    content='posts',
    content_rowid='id'
);

-- Insert data
INSERT INTO posts_fts (rowid, title, content)
SELECT id, title, content FROM posts;

-- Search
SELECT title, content
FROM posts_fts
WHERE posts_fts MATCH 'sqlite AND optimization';
```

### 2. JSON Support

```sql
-- Create table with JSON
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    attributes TEXT NOT NULL CHECK (json_valid(attributes))
);

-- Insert JSON data
INSERT INTO products (name, attributes)
VALUES (
    'Smartphone',
    json_object(
        'color', 'black',
        'storage', '128GB',
        'features', json_array('5G', 'NFC', 'Bluetooth')
    )
);

-- Query JSON data
SELECT name, json_extract(attributes, '$.color') as color
FROM products
WHERE json_extract(attributes, '$.storage') = '128GB';
```

## Mobile Integration

### 1. Android Implementation

```kotlin
// Database helper
class DatabaseHelper(context: Context) : SQLiteOpenHelper(
    context, DATABASE_NAME, null, DATABASE_VERSION
) {
    companion object {
        private const val DATABASE_NAME = "app.db"
        private const val DATABASE_VERSION = 1
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
    }
}
```

### 2. iOS Implementation

```swift
// Database manager
class DatabaseManager {
    static let shared = DatabaseManager()
    private var db: OpaquePointer?

    private init() {
        let fileURL = try! FileManager.default
            .url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            .appendingPathComponent("app.sqlite")

        if sqlite3_open(fileURL.path, &db) == SQLITE_OK {
            createTables()
        }
    }

    private func createTables() {
        let createTableQuery = """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        // Execute query
    }
}
```

## Backup and Recovery

### 1. Backup Strategies

```bash
# Backup database
sqlite3 app.db ".backup 'backup.db'"

# Backup with compression
sqlite3 app.db ".backup 'backup.db'" | gzip > backup.db.gz

# Restore from backup
sqlite3 app.db ".restore 'backup.db'"
```

### 2. Point-in-Time Recovery

```sql
-- Enable WAL mode
PRAGMA journal_mode = WAL;

-- Create backup
sqlite3 app.db ".backup 'backup.db'"

-- Restore from backup
sqlite3 app.db ".restore 'backup.db'"
```

## Security

### 1. Data Encryption

```sql
-- Enable encryption (using SQLCipher)
PRAGMA key = 'your-encryption-key';

-- Create encrypted table
CREATE TABLE sensitive_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL
);
```

### 2. Access Control

```sql
-- Create view with row-level security
CREATE VIEW user_posts AS
SELECT p.*
FROM posts p
INNER JOIN users u ON p.user_id = u.id
WHERE u.id = current_user_id();

-- Grant access to view
GRANT SELECT ON user_posts TO app_user;
```

## Best Practices

### 1. Performance

- Use appropriate indexes
- Optimize queries
- Use prepared statements
- Implement connection pooling
- Monitor performance

### 2. Maintenance

- Regular vacuuming
- Index maintenance
- Statistics updates
- Backup strategy
- Error handling

## Conclusion

SQLite offers:

- Lightweight design
- Zero configuration
- Serverless operation
- Cross-platform support
- Strong reliability

Remember to:

- Design carefully
- Optimize queries
- Handle concurrency
- Implement security
- Regular maintenance

Happy SQLite development!
