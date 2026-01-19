<?php
session_start();

// Load environment variables from .env file
$env_file = __DIR__ . '/.env';
if (file_exists($env_file)) {
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Get database credentials from environment
$db_host = $_ENV['DB_HOST'] ?? 'localhost';
$db_name = $_ENV['DB_NAME'] ?? 'audiohub';
$db_user = $_ENV['DB_USER'] ?? 'root';
$db_pass = $_ENV['DB_PASS'] ?? '';

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: register.php');
    exit;
}

// Get form inputs
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';
$age = !empty($_POST['age']) ? (int)$_POST['age'] : null;
$gender = !empty($_POST['gender']) ? $_POST['gender'] : null;

// Validate inputs
if (empty($username) || empty($email) || empty($password)) {
    $_SESSION['register_error'] = 'Username, email, and password are required.';
    header('Location: register.php');
    exit;
}

if (strlen($username) < 3 || strlen($username) > 50) {
    $_SESSION['register_error'] = 'Username must be between 3 and 50 characters.';
    header('Location: register.php');
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $_SESSION['register_error'] = 'Please enter a valid email address.';
    header('Location: register.php');
    exit;
}

if (strlen($password) < 6) {
    $_SESSION['register_error'] = 'Password must be at least 6 characters long.';
    header('Location: register.php');
    exit;
}

if ($password !== $confirm_password) {
    $_SESSION['register_error'] = 'Passwords do not match.';
    header('Location: register.php');
    exit;
}

if ($age !== null && ($age < 13 || $age > 120)) {
    $_SESSION['register_error'] = 'Age must be between 13 and 120.';
    header('Location: register.php');
    exit;
}

try {
    // Create database connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed.');
    }
    
    // Check if username already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $_SESSION['register_error'] = 'Username already exists.';
        $stmt->close();
        $conn->close();
        header('Location: register.php');
        exit;
    }
    $stmt->close();
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $_SESSION['register_error'] = 'Email already exists.';
        $stmt->close();
        $conn->close();
        header('Location: register.php');
        exit;
    }
    $stmt->close();
    
    // Hash password securely
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, age, gender, status) VALUES (?, ?, ?, ?, ?, 'active')");
    $stmt->bind_param("sssis", $username, $email, $hashed_password, $age, $gender);
    
    if ($stmt->execute()) {
        $_SESSION['register_success'] = 'Registration successful! You can now login.';
        $stmt->close();
        $conn->close();
        header('Location: index.php');
        exit;
    } else {
        throw new Exception('Registration failed. Please try again.');
    }
    
} catch (Exception $e) {
    $_SESSION['register_error'] = 'An error occurred during registration. Please try again.';
    if (isset($conn)) {
        $conn->close();
    }
    header('Location: register.php');
    exit;
}
?>
