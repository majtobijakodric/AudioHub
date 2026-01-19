<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AudioHub - Login</title>
</head>

<body>
    <?php
    if (isset($_GET['registered']) && $_GET['registered'] == '1') {
        echo 'Registration successful. You can now log in.';
    }
    ?>
    <form method="POST" action="../src/login_acc.php">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>

    <p>Don't have an account? <a href="register.php">Register here</a>.</p>
</body>

</html>