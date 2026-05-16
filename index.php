<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Basic button styling for anchor tags */
a.button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  font-family: Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Hover effect */
a.button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Active/Click effect */
a.button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Focus effect for accessibility */
a.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.4);
}

/* Optional: Different button variants */
a.button.secondary {
  background-color: #6c757d;
}

a.button.secondary:hover {
  background-color: #5a6268;
}

a.button.success {
  background-color: #28a745;
}

a.button.success:hover {
  background-color: #218838;
}

a.button.danger {
  background-color: #dc3545;
}

a.button.danger:hover {
  background-color: #c82333;
}

a.button.outline {
  background-color: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

a.button.outline:hover {
  background-color: #007bff;
  color: white;
}

/* Sizes */
a.button.small {
  padding: 8px 16px;
  font-size: 14px;
}

a.button.large {
  padding: 16px 32px;
  font-size: 18px;
}

/* Full width button */
a.button.full-width {
  display: block;
  width: 100%;
}
    </style>
    <title>Clankeradar</title>
</head>
<body>
    <a type="button" class="button" href="live/walletVerify.php">Link Social Media Account to your Wallet</a><br><br>
    <a type="button" class="button" href="live/checkWallet.php">Check Account Status</a>
</body>
</html>
