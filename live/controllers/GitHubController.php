<?php
// controllers/GitHubController.php
session_start();

class GitHubController
{
    /**
     * Check if a GitHub username exists and is public
     *
     * @param string $username
     * @return bool
     */
    public function usernameExists($username)
    {
        $url = "https://api.github.com/users/" . urlencode($username);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        // A custom User-Agent is required by the GitHub API
        curl_setopt($ch, CURLOPT_USERAGENT, 'PHP-GitHub-Verifier/1.0');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // A 200 OK status code means the user exists.
        return $httpCode === 200;
    }
    
    /**
     * Generate an 8-character alphanumeric code, store it in session.
     *
     * @return string
     */
    public function generateCode()
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $code = '';
        for ($i = 0; $i < 8; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }

        $_SESSION['github_verification'] = [
            'username'   => null,
            'code'       => $code,
            'expires_at' => time() + 1800, // 30 minutes
            'verified'   => false,
        ];

        return $code;
    }
    
    /**
     * Store the GitHub username to verify.
     *
     * @param string $username
     */
    public function setUsername($username)
    {
        if (isset($_SESSION['github_verification'])) {
            $_SESSION['github_verification']['username'] = $username;
        }
    }
    
    /**
     * Check if the temporary code is still valid.
     *
     * @return bool
     */
    public function isCodeValid()
    {
        return isset($_SESSION['github_verification']['expires_at'])
            && $_SESSION['github_verification']['expires_at'] > time();
    }
    
    /**
     * Fetches the user's GitHub profile via API and checks for the code in the bio.
     *
     * @param string $username
     * @param string $code
     * @return bool
     */
    public function checkProfileForCode($username, $code)
    {
        // The API endpoint for public user data.
        $url = "https://api.github.com/users/" . urlencode($username);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'PHP-GitHub-Verifier/1.0'); // Required by GitHub API
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            return false; // User not found or API error.
        }
        
        $data = json_decode($response, true);
        $bio = $data['bio'] ?? ''; // Get the bio from the response
        
        // Check if the verification code is present in the bio.
        return strpos($bio, $code) !== false;
    }
    
    /**
     * Complete the verification process.
     *
     * @param string $username
     */
    public function completeVerification($username)
    {
        // You can link this to your wallet session variable.
        $wallet = $_SESSION['wallet'] ?? 'unknown_wallet';
        $_SESSION['linked_accounts']['github'] = $username;
        $_SESSION['github_verification']['verified'] = true;
    }
    
    /**
     * Helper function for you to debug and see the raw API response.
     *
     * @param string $username
     * @return array
     */
    public function debugProfileContent($username)
    {
        $url = "https://api.github.com/users/" . urlencode($username);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'PHP-GitHub-Verifier/1.0');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $data = json_decode($response, true);
        
        return [
            'username' => $username,
            'http_code' => $httpCode,
            'bio_from_api' => $data['bio'] ?? 'Bio not found in API response',
            'full_api_response' => $data // This will show you everything the API returns
        ];
    }
}
?>