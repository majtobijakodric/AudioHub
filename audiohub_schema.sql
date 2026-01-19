-- AudioHub Database Schema
-- MySQL/MariaDB Database Setup

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS audiohub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================================
-- Table: Genres 
-- ============================================================================
CREATE TABLE IF NOT EXISTS genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: Users 
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: Songs (Pesmi / Video posnetki)
-- ============================================================================
CREATE TABLE IF NOT EXISTS songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    genre_id INT,
    youtube_video_id VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    channel_name VARCHAR(255),
    description TEXT,
    duration INT,
    youtube_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    youtube_published_at DATETIME,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    import_status ENUM('pending', 'downloading', 'ready', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_genre_id (genre_id),
    INDEX idx_youtube_video_id (youtube_video_id),
    INDEX idx_import_status (import_status),
    INDEX idx_imported_at (imported_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Insert Default Genres
-- ============================================================================
INSERT INTO genres (name, description) VALUES
    ('Pop', 'Popular music'),
    ('Rock', 'Rock music'),
    ('Hip Hop', 'Hip hop and rap music'),
    ('Electronic', 'Electronic and dance music'),
    ('Classical', 'Classical music'),
    ('Jazz', 'Jazz music'),
    ('R&B', 'Rhythm and blues'),
    ('Country', 'Country music'),
    ('Metal', 'Heavy metal music'),
    ('Alternative', 'Alternative music'),
    ('Indie', 'Independent music'),
    ('Folk', 'Folk music'),
    ('Blues', 'Blues music'),
    ('Reggae', 'Reggae music'),
    ('Soul', 'Soul music'),
    ('Other', 'Other or unclassified')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================================================
-- Example Queries
-- ============================================================================

-- Create a test user (use password_hash() in PHP!)
-- INSERT INTO users (username, email, password, age, gender) 
-- VALUES ('testuser', 'test@example.com', '$2y$10$...hash...', 25, 'male');
-- 
-- Import a YouTube video
-- INSERT INTO songs (user_id, youtube_video_id, title, channel_name, duration, youtube_url, thumbnail_url, genre_id)
-- VALUES (1, 'dQw4w9WgXcQ', 'Rick Astley - Never Gonna Give You Up', 'Rick Astley', 213, 
--         'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
--         'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg', 1);

-- Get all songs imported by a user
-- SELECT s.*, g.name as genre_name 
-- FROM songs s 
-- LEFT JOIN genres g ON s.genre_id = g.id 
-- WHERE s.user_id = 1 
-- ORDER BY s.imported_at DESC;

-- Get user statistics
-- SELECT u.username, COUNT(s.id) as total_songs, 
--        SUM(CASE WHEN s.import_status = 'ready' THEN 1 ELSE 0 END) as ready_songs
-- FROM users u 
-- LEFT JOIN songs s ON u.id = s.user_id 
-- GROUP BY u.id;
