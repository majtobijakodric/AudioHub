<?php
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
} else {
    die("Error: .env file not found. Please create a .env file with database credentials.");
}

// Get database credentials from environment; if fails, use defaults
$db_host = $_ENV['DB_HOST'] ?? 'localhost';
$db_name = $_ENV['DB_NAME'] ?? 'audiohub';
$db_user = $_ENV['DB_USER'] ?? 'root';
$db_pass = $_ENV['DB_PASS'] ?? '';

// Create MySQL connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . htmlspecialchars($conn->connect_error));
}

// Get username and password from POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Validate inputs are not empty
    if (empty($username) || empty($password)) {
        echo "Error: Username and password are required.";
        $conn->close();
        exit;
    }

    // Query database for user with secure prepared statement
    $query = "SELECT id, username, password FROM users WHERE username = ?";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        die("Prepare failed: " . htmlspecialchars($conn->error));
    }
    
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Verify password using secure hashing
        if (password_verify($password, $user['password'])) {
            echo "Login successful! Welcome, " . htmlspecialchars($user['username']) . ".";
            // TODO: Start session and redirect to dashboard
            // session_start();
            // $_SESSION['user_id'] = $user['id'];
            // header('Location: dashboard.php');
        } else {
            echo "Error: Invalid username or password.";
        }
    } else {
        echo "Error: Invalid username or password.";
    }
    
    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request method.";
    $conn->close();
}
?>
