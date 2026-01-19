<?php
// Load environment variables from .env file
$env_file = __DIR__ . '/.env';
$connection_status = '';
$connection_class = '';

if (file_exists($env_file)) {
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Get database credentials from environment; if fails, use defaults
$db_host = $_ENV['DB_HOST'] ?? 'localhost';
$db_name = $_ENV['DB_NAME'] ?? 'audiohub';
$db_user = $_ENV['DB_USER'] ?? 'root';
$db_pass = $_ENV['DB_PASS'] ?? '';

// Test database connection
try {
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    $connection_status = 'Connection Successful';
    $connection_class = 'success';
    $conn->close();
} catch (mysqli_sql_exception $e) {
    $connection_status = 'Connection Failed: ' . htmlspecialchars($e->getMessage());
    $connection_class = 'error';
}
?>
