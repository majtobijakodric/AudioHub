<?php
require_once __DIR__ . '/src/database.php';
$db = Database::getInstance();
$conn = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        die('Error: Username and password are required.');
    }

    $stmt = $conn->prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    $stmt->bind_param('ss', $username, $password);
    $stmt->execute();

    if ($stmt->affected_rows === 1) {
        // Redirect to login page
        header('Location: index.php?registered=1');
        exit();
    } else {
        die('Error: Registration failed.');
    }

    $stmt->close();
}
