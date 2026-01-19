<?php
// This allows us to track logged-in users across pages
session_start();

// Check if .env file exists and load it
if (file_exists(__DIR__ . '/.env')) {
    $env = parse_ini_file(__DIR__ . '/.env');
} else {
    die('Error: .env file not found.');
}

// Check if .env has required variables
if (empty($env['DB_HOST']) || empty($env['DB_USER']) || empty($env['DB_NAME'])) {
    die('Error: Missing required .env variables.');
}

// Create database connection
$conn = new mysqli(
    $env['DB_HOST'] ?? 'localhost',
    $env['DB_USER'] ?? 'root',
    $env['DB_PASS'] ?? '',
    $env['DB_NAME'] ?? 'audiohub'
);

// Check connection
if ($conn->connect_error) {
    die('Database connection failed: ' . $conn->connect_error);
}


$conn->set_charset('utf8mb4');

// Process login form here (when implemented)
// TODO: Validate username/password against database
