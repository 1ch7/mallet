<?php
// index.php - Main HTML file with demo buttons
require_once 'controllers/checkController.php';

$controller = new checkController('3DnUE3NupdMwpA8b4crqbgqjj37'); // No API key needed for demo mode
$analysisResult = null;
$error = null;
$address = '';
$isDemo = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['address'])) {
    $address = trim($_POST['address']);
    
    if (empty($address)) {
        $error = 'Please enter a wallet address';
    } else {
        $result = $controller->analyzeWallet($address);
        
        if (isset($result['error'])) {
            $error = $result['error'];
        } else {
            $analysisResult = $result;
            $isDemo = $result['is_demo'] ?? false;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monad Blitz - Wallet Analyzer</title>
    <style>
        /* Your existing styles */
        body { font-family: Arial, sans-serif; margin: 2em; }
        .demo-buttons { margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 8px; }
        .demo-btn { 
            display: inline-block; 
            padding: 8px 15px; 
            margin: 5px; 
            background: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px;
            cursor: pointer;
        }
        .demo-btn:hover { background: #45a049; }
        .demo-badge { 
            background: #ff9800; 
            color: white; 
            padding: 2px 8px; 
            border-radius: 4px; 
            font-size: 12px;
            margin-left: 10px;
        }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-safe { color: #28a745; font-weight: bold; }
        .status-suspicious { color: #fd7e14; font-weight: bold; }
        .status-malicious { color: #dc3545; font-weight: bold; }
        .error-message { color: red; margin-top: 20px; padding: 10px; background-color: #ffeeee; border: 1px solid red; border-radius: 4px; }
        .summary-box { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>🔍 Monad Blitz - Wallet Analyzer</h1>
<!--     
    <div class="demo-buttons">
        <strong>🎮 Demo Mode:</strong> Try these example wallets:
        <a href="#" onclick="setAddress('demo_safe')" class="demo-btn">Demo: Safe</a>
        <a href="#" onclick="setAddress('demo_suspicious')" class="demo-btn">Demo: Suspicious</a>
        <a href="#" onclick="setAddress('demo_malicious')" class="demo-btn">🚫 Demo: Malicious</a>
    </div> -->
    
    <form method="POST" id="walletForm">
        <label for="address">Wallet Address:</label><br>
        <input type="text" name="address" id="address" value="<?php echo htmlspecialchars($address); ?>" 
               placeholder="Enter wallet address (e.g., 0x... or demo_safe)" size="50" autocomplete="off">
        <br><br>
        <button type="submit">Analyze Wallet</button>
        <a href="index.php">
            <button type="button">Back</button>
        </a>
    </form>
    
    <script>
        function setAddress(addr) {
            document.getElementById('address').value = addr;
            document.getElementById('walletForm').submit();
        }
    </script>
    
    <?php if ($error): ?>
        <div class="error-message">⚠️ <?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <?php if ($analysisResult): ?>
        <?php if ($isDemo): ?>
            <div class="summary-box" style="background: #fff3e0; border-color: #ff9800;">
                🎮 <strong>Demo Mode</strong> - This is simulated data for demonstration purposes
            </div>
        <?php endif; ?>
        
        <?php
        // Calculate status
        $totalTransactions = $analysisResult['total_transactions_6months'] ?? 0;
        $flaggedCount = $analysisResult['total_flagged_count'] ?? 0;
        $creationDate = $analysisResult['creation_date'] ?? null;
        
        // Calculate wallet age
        $walletAgeDays = 0;
        if ($creationDate) {
            try {
                // Check if timestamp is in milliseconds (13+ digits)
                if (is_numeric($creationDate) && strlen((string)$creationDate) >= 13) {
                    // Convert milliseconds to seconds
                    $creationDateSeconds = (int)($creationDate / 1000);
                    $created = new DateTime("@$creationDateSeconds");
                } else {
                    // Try parsing as string date or seconds timestamp
                    $created = new DateTime($creationDate);
                }
                $now = new DateTime();
                $walletAgeDays = $created->diff($now)->days;
            } catch (Exception $e) {
                $walletAgeDays = 0;
                error_log("Date parsing error: " . $e->getMessage());
            }
        }
        
        // Determine status
        if ($flaggedCount > 0) {
            $status = 'malicious';
        } elseif ($totalTransactions === 0 || ($walletAgeDays > 0 && $walletAgeDays < 365)) {
            $status = 'suspicious';
        } else {
            $status = 'safe';
        }
        
        $statusClass = $status === 'safe' ? 'status-safe' : ($status === 'suspicious' ? 'status-suspicious' : 'status-malicious');
        $statusIcon = $status === 'safe' ? '✅' : ($status === 'suspicious' ? '⚠️' : '🚫');
        ?>
        
        <div class="summary-box">
            <strong>📊 Analysis Summary:</strong> 
            Analyzed <?php echo $analysisResult['analyzed_transactions'] ?? 0; ?> transactions from the last 6 months
            <?php if ($analysisResult['balance'] ?? false): ?>
                <br><strong>💰 Balance:</strong> <?php echo $analysisResult['balance']; ?>
            <?php endif; ?>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Wallet ID</th>
                    <th>Age</th>
                    <th>Transaction Count (6 months)</th>
                    <th>Flagged Interactions</th>
                    <th>Status</th>
                    <th>Last Transaction</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code><?php echo htmlspecialchars($analysisResult['address']); ?></code></td>
                    <td><?php echo $walletAgeDays > 0 ? $walletAgeDays . ' days' : 'Unknown'; ?></td>
                    <td><?php echo $totalTransactions; ?></td>
                    <td style="color: <?php echo $flaggedCount > 0 ? '#dc3545' : '#28a745'; ?>; font-weight: bold;">
                        <?php echo $flaggedCount; ?>
                    </td>
                    <td class="<?php echo $statusClass; ?>"><?php echo $statusIcon . ' ' . ucfirst($status); ?></td>
                    <td><?php echo $analysisResult['last_transaction'] ? date('Y-m-d', strtotime($analysisResult['last_transaction'])) : 'N/A'; ?></td>
                </tr>
            </tbody>
        </table>
        
        <?php if (!empty($analysisResult['flagged_interactions'])): ?>
            <div style="background-color: #ff9800; color: white; padding: 10px; margin-top: 20px; font-weight: bold; border-radius: 4px;">
                🚨 Flagged Address Interactions
            </div>
            <table style="margin-top: 10px;">
                <thead>
                    <tr style="background-color: #ffcc80;">
                        <th>Flagged Address</th>
                        <th>Interaction Count</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($analysisResult['flagged_interactions'] as $flaggedAddr => $count): ?>
                    <tr>
                        <td><code><?php echo htmlspecialchars($flaggedAddr); ?></code></td>
                        <td style="color: #ff9800; font-weight: bold;">⚠️ <?php echo $count; ?> transactions</td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
        
    <?php endif; ?>
</body>
</html>