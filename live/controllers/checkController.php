<?php
// controllers/checkController.php

class checkController {
    protected ?string $apiKey;
    private bool $demoMode = false; // Enable demo mode
    
    // Hardcoded demo users with realistic data
    private array $demoUsers = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0b6f0' => [
            'address' => '0x742d35Cc6634C0532925a3b844Bc9e7595f0b6f0',
            'creation_date' => '2023-01-15T10:30:00Z',
            'total_transactions_6months' => 45,
            'flagged_interactions' => [
                '0x1234567890123456789012345678901234567890' => 3,
                '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' => 1
            ],
            'total_flagged_count' => 4,
            'analyzed_transactions' => 45,
            'last_transaction' => '2024-12-01T15:20:00Z',
            'balance' => '1,234.56 MON'
        ],
        '0x4ea043757F7D2E0B386b26E57633eD97863FF63D' => [
            'address' => '0x4ea043757F7D2E0B386b26E57633eD97863FF63D',
            'creation_date' => '2024-06-20T08:15:00Z',
            'total_transactions_6months' => 12,
            'flagged_interactions' => [],
            'total_flagged_count' => 0,
            'analyzed_transactions' => 12,
            'last_transaction' => '2024-11-28T09:45:00Z',
            'balance' => '567.89 MON'
        ],
        '0x4951b1018033954f02e96ec9b7375336b5f7b6da' => [
            'address' => '0x4951b1018033954f02e96ec9b7375336b5f7b6da',
            'creation_date' => '2024-11-01T14:20:00Z',
            'total_transactions_6months' => 8,
            'flagged_interactions' => [
                '0x9999999999999999999999999999999999999999' => 2
            ],
            'total_flagged_count' => 2,
            'analyzed_transactions' => 8,
            'last_transaction' => '2024-12-02T11:30:00Z',
            'balance' => '89.12 MON'
        ],
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' => [
            'address' => '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
            'creation_date' => '2023-11-10T22:00:00Z',
            'total_transactions_6months' => 128,
            'flagged_interactions' => [
                '0x1234567890123456789012345678901234567890' => 15,
                '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' => 8,
                '0x9999999999999999999999999999999999999999' => 12
            ],
            'total_flagged_count' => 35,
            'analyzed_transactions' => 128,
            'last_transaction' => '2024-12-02T18:45:00Z',
            'balance' => '15,678.90 MON'
        ],
        'demo_safe' => [
            'address' => 'demo_safe',
            'creation_date' => '2023-01-01T00:00:00Z',
            'total_transactions_6months' => 50,
            'flagged_interactions' => [],
            'total_flagged_count' => 0,
            'analyzed_transactions' => 50,
            'last_transaction' => '2024-12-01T12:00:00Z',
            'balance' => '10,000 MON'
        ],
        'demo_suspicious' => [
            'address' => 'demo_suspicious',
            'creation_date' => '2024-11-15T00:00:00Z',
            'total_transactions_6months' => 0,
            'flagged_interactions' => [],
            'total_flagged_count' => 0,
            'analyzed_transactions' => 5,
            'last_transaction' => '2024-12-01T10:00:00Z',
            'balance' => '100 MON'
        ],
        'demo_malicious' => [
            'address' => 'demo_malicious',
            'creation_date' => '2023-06-01T00:00:00Z',
            'total_transactions_6months' => 200,
            'flagged_interactions' => [
                '0x1234567890123456789012345678901234567890' => 45,
                '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' => 30
            ],
            'total_flagged_count' => 75,
            'analyzed_transactions' => 200,
            'last_transaction' => '2024-12-02T20:00:00Z',
            'balance' => '5,000 MON'
        ]
    ];
    
    // Hardcoded flagged addresses for demo
    private array $flaggedAddresses = [
        '0x1234567890123456789012345678901234567890' => 'Known Scam Wallet',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' => 'Suspicious Exchange',
        '0x9999999999999999999999999999999999999999' => 'Flagged by Authority'
    ];
    
    public function __construct(?string $apiKey = null) {
        $this->apiKey = $apiKey;
    }
    
    /**
     * Check if we have a hardcoded demo user
     */
    private function isDemoUser(string $address): bool {
        return isset($this->demoUsers[$address]) || str_starts_with($address, 'demo_');
    }
    
    /**
     * Get demo user data
     */
    private function getDemoUserData(string $address): array {
        // Handle demo_ prefixed addresses
        if (str_starts_with($address, 'demo_')) {
            return $this->demoUsers[$address];
        }
        return $this->demoUsers[$address] ?? null;
    }
    
    /**
     * Get transaction history (supports both real API and demo mode)
     */
    public function getTransactionHistory(string $address, int $limit = 50, string $cursor = ''): array {
        // Return demo data if in demo mode and user exists
        if ($this->demoMode && $this->isDemoUser($address)) {
            $demoData = $this->getDemoUserData($address);
            if ($demoData) {
                // Generate mock transactions based on demo data
                $transactions = $this->generateMockTransactions($address, $demoData);
                return [
                    'success' => true,
                    'transactions' => $transactions,
                    'nextCursor' => '',
                    'is_demo' => true
                ];
            }
        }
        
        // Real API call (if API key is provided)
        if ($this->apiKey) {
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
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'accept: application/json',
                'x-api-key: ' . $this->apiKey
            ]);
            
            $response = curl_exec($ch);
            curl_close($ch);
            
            $data = json_decode($response, true);
            
            if (isset($data['result']['data'])) {
                return [
                    'success' => true,
                    'transactions' => $data['result']['data'],
                    'nextCursor' => $data['result']['nextPageCursor'] ?? ''
                ];
            }
        }
        
        return ['error' => 'Failed to fetch transactions'];
    }
    
    /**
     * Generate mock transactions for demo users
     */
    private function generateMockTransactions(string $address, array $userData): array {
        $transactions = [];
        $flaggedAddrs = array_keys($this->flaggedAddresses);
        
        // Generate transactions based on flagged count
        $totalTx = min($userData['total_transactions_6months'], 20); // Limit for demo
        
        for ($i = 0; $i < $totalTx; $i++) {
            $isFlagged = $i < $userData['total_flagged_count'];
            $timestamp = strtotime($userData['creation_date']) + ($i * 86400 * 7); // Weekly transactions
            
            $transactions[] = [
                'hash' => '0x' . substr(md5($address . $i), 0, 64),
                'timestamp' => date('Y-m-d H:i:s', $timestamp),
                'from' => $isFlagged && count($flaggedAddrs) > 0 ? $flaggedAddrs[array_rand($flaggedAddrs)] : $address,
                'to' => $isFlagged ? $address : '0x' . substr(md5('to_' . $i), 0, 40),
                'value' => (string)(rand(1, 100) * pow(10, 18)),
                'status' => 1
            ];
        }
        
        return $transactions;
    }
    
    public function getAllTransactions(string $address, int $maxTransactions = 1000): array {
        $result = $this->getTransactionHistory($address, min($maxTransactions, 50));
        
        if (isset($result['error'])) {
            return ['error' => $result['error']];
        }
        
        return [
            'success' => true,
            'transactions' => $result['transactions'],
            'count' => count($result['transactions']),
            'is_demo' => $result['is_demo'] ?? false
        ];
    }
    
    public function analyzeWallet(string $address): array {
        // Check for demo user first
        if ($this->demoMode && $this->isDemoUser($address)) {
            $demoData = $this->getDemoUserData($address);
            if ($demoData) {
                return array_merge($demoData, ['success' => true, 'is_demo' => true]);
            }
        }
        
        // Real wallet analysis
        $result = $this->getAllTransactions($address);
        
        if (isset($result['error'])) {
            return ['error' => $result['error']];
        }
        
        $transactions = $result['transactions'];
        $sixMonthsAgo = strtotime('-6 months');
        
        // Filter transactions from last 6 months
        $recentTransactions = array_filter($transactions, function($tx) use ($sixMonthsAgo) {
            $txTime = isset($tx['timestamp']) ? strtotime($tx['timestamp']) : 0;
            return $txTime >= $sixMonthsAgo;
        });
        
        $recentCount = count($recentTransactions);
        
        // Count interactions with flagged addresses
        $flaggedInteractions = [];
        foreach ($this->flaggedAddresses as $flaggedAddr => $label) {
            $count = 0;
            foreach ($recentTransactions as $tx) {
                $fromAddr = $tx['from'] ?? '';
                $toAddr = $tx['to'] ?? '';
                
                if (strcasecmp($fromAddr, $flaggedAddr) === 0 || 
                    strcasecmp($toAddr, $flaggedAddr) === 0) {
                    $count++;
                }
            }
            
            if ($count > 0) {
                $flaggedInteractions[$flaggedAddr] = $count;
            }
        }
        
        // Get wallet creation date
        $creationDate = null;
        $lastTransaction = null;
        
        if (!empty($transactions)) {
            usort($transactions, function($a, $b) {
                $timeA = strtotime($a['timestamp'] ?? '0');
                $timeB = strtotime($b['timestamp'] ?? '0');
                return $timeA - $timeB;
            });
            
            $firstTx = $transactions[0];
            $creationDate = $firstTx['timestamp'] ?? null;
            
            $lastTx = end($transactions);
            $lastTransaction = $lastTx['timestamp'] ?? null;
        }
        
        return [
            'success' => true,
            'address' => $address,
            'creation_date' => $creationDate,
            'total_transactions_6months' => $recentCount,
            'flagged_interactions' => $flaggedInteractions,
            'total_flagged_count' => array_sum($flaggedInteractions),
            'analyzed_transactions' => count($recentTransactions),
            'last_transaction' => $lastTransaction,
            'is_demo' => false
        ];
    }
    
    /**
     * Get list of demo addresses for UI
     */
    public function getDemoAddresses(): array {
        return array_keys($this->demoUsers);
    }
    
    /**
     * Get flagged addresses with labels
     */
    public function getFlaggedAddresses(): array {
        return $this->flaggedAddresses;
    }
}
?>