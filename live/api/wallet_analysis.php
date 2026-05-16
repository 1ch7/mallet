<?php
// api/wallet_analysis.php
header('Content-Type: application/json');
require_once '../controllers/checkController.php';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Only POST requests allowed']);
    exit;
}

// Get the wallet address from POST data
$address = trim($_POST['address'] ?? '');

if (empty($address)) {
    echo json_encode(['success' => false, 'error' => 'Wallet address is required']);
    exit;
}

// Validate address format (basic Monad/EVM address check)
if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $address)) {
    echo json_encode(['success' => false, 'error' => 'Invalid wallet address format']);
    exit;
}

try {
    // Initialize controller with your API key
    $controller = new checkController('3DnUE3NupdMwpA8b4crqbgqjj37'); // Your working API key
    
    // Analyze the wallet
    $result = $controller->analyzeWallet($address);
    
    if (isset($result['error'])) {
        echo json_encode(['success' => false, 'error' => $result['error']]);
        exit;
    }
    
    // Calculate last transaction date (newest transaction)
    $lastTransaction = null;
    if (!empty($result['transactions'])) {
        // Transactions are already in descending order (newest first)
        $newestTx = $result['transactions'][0];
        if (isset($newestTx['timestamp'])) {
            $lastTransaction = $newestTx['timestamp'];
        }
    }
    
    // Prepare response for frontend
    $response = [
        'success' => true,
        'address' => $result['address'],
        'creation_date' => $result['creation_date'],
        'total_transactions_6months' => $result['total_transactions_6months'],
        'flagged_interactions' => $result['flagged_interactions'],
        'total_flagged_count' => $result['total_flagged_count'],
        'analyzed_transactions' => $result['analyzed_transactions'],
        'last_transaction' => $lastTransaction
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
?>