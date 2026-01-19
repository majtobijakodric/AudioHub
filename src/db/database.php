<?php
class Database
{
    private static $instance = null;
    private $conn;

    private function __construct()
    {
        // Load environment variables
        if (file_exists(__DIR__ . '/../../.env')) {
            $env = parse_ini_file(__DIR__ . '/../../.env');
        } else {
            die('Error: .env file not found.');
        }

        // Validate required variables
        if (empty($env['DB_HOST']) || empty($env['DB_USER']) || empty($env['DB_NAME'])) {
            die('Error: Missing required .env variables.');
        }

        // Create connection
        $this->conn = new mysqli(
            $env['DB_HOST'] ?? 'localhost',
            $env['DB_USER'] ?? 'root',
            $env['DB_PASS'] ?? '',
            $env['DB_NAME'] ?? 'audiohub'
        );

        // Check connection
        if ($this->conn->connect_error) {
            die('Database connection failed: ' . $this->conn->connect_error);
        }

        $this->conn->set_charset('utf8mb4');
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->conn;
    }
}
