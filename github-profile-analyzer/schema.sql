-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS github_analyzer_db;
USE github_analyzer_db;

-- Table to store Github Profiles and Repository Insights
CREATE TABLE IF NOT EXISTS github_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150),
    bio TEXT,
    avatar_url VARCHAR(2083),
    profile_url VARCHAR(2083),
    public_repos INT DEFAULT 0,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME,
    account_age_years DECIMAL(5, 2),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Repository Insights
    total_repositories INT DEFAULT 0,
    total_stars INT DEFAULT 0,
    total_forks INT DEFAULT 0,
    most_starred_repository VARCHAR(255),
    most_used_programming_language VARCHAR(100),
    average_stars_per_repository DECIMAL(10, 2) DEFAULT 0.00,
    
    INDEX idx_username (username),
    INDEX idx_analyzed_at (analyzed_at)
);
