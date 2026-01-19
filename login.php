<?php
// This allows us to track logged-in users across pages
session_start();

require_once __DIR__ . '/src/database.php';
$db = Database::getInstance();
$conn = $db->getConnection();

// Handle login form submission
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (empty($username) || empty($password)) {
        die('Error: Username and password are required.');
    }

    // Prepare and execute the SQL statement to prevent SQL injection
    // Using plain-text password column for testing
    $stmt = $conn->prepare('SELECT id, password FROM users WHERE username = ?');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($user_id, $stored_password);
        $stmt->fetch();

        // Verify the password
        if ($password === $stored_password) {
            // Successful login
            $_SESSION['user_id'] = $user_id;
            $_SESSION['username'] = $username;
            header('Location: dashboard.php');
            exit();
        } else {
            die('Error: Invalid username or password.');
        }
    } else {
        die('Error: Invalid username or password.');
    }

    $stmt->close();
}

$stmt->close();
