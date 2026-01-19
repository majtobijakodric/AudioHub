<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AudioHub - Login</title>
    <style>
        .connection-status {
            padding: 10px;
            margin: 20px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        }

        .success {
            color: #155724;
            background-color: #d4edda;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }

        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>

<body>
    <?php include 'connection_status.php'; ?>

    <?php
    if (isset($_SESSION['register_success'])) {
        echo '<div class="success">' . htmlspecialchars($_SESSION['register_success']) . '</div>';
        unset($_SESSION['register_success']);
    }
    ?>

    <div class="connection-status <?php echo $connection_class; ?>">
        <?php echo $connection_status; ?>
    </div>

    <form method="POST" action="login.php">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" placeholder="Username" required>
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" placeholder="Password" required>
        <br>
        <button type="submit">Login</button>
    </form>

    <p style="text-align: center; margin-top: 20px;">
        Don't have an account? <a href="register.php">Register here</a>
    </p>
</body>

</html>
