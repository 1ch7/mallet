<?php
// test_debug.php
require_once 'controllers/checkController.php';

// Add this temporary debug version
class DebugController extends checkController {
    public function getTransactionHistory(string $address, int $limit = 50, string $cursor = ''): array {
        $url = "https://api.blockvision.org/v2/monad/account/transactions";
        $params = [
            'address' => $address,
            'limit' => min($limit, 50),
            'ascendingOrder' => 'false'
        ];
        
        if (!empty($cursor)) {
            $params['cursor'] = $cursor;
        }
        
        $url .= '?' . http_build_query($params);
        
        echo "Debug: Requesting URL: $url\n\n";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'accept: application/json',
            'x-api-key: ' . $this->apiKey
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        echo "Debug: HTTP Status Code: $httpCode\n";
        echo "Debug: CURL Error: " . ($curlError ?: 'None') . "\n";
        echo "Debug: Raw Response: $response\n\n";
        
        $data = json_decode($response, true);
        
        if (!isset($data['result']['data'])) {
            return ['error' => 'Failed to fetch transactions', 'debug_response' => $data];
        }
        
        return [
            'success' => true,
            'transactions' => $data['result']['data'],
            'nextCursor' => $data['result']['nextPageCursor'] ?? ''
        ];
    }
}

// Use the debug version
$controller = new DebugController('3DnUE3NupdMwpA8b4crqbgqjj37');
$result = $controller->getTransactionHistory('0x4951b1018033954f02e96ec9b7375336b5f7b6da');

echo "Final Result:\n";
print_r($result);
?>