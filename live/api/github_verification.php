<?php
// api/github_verification.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../controllers/GitHubController.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Only POST requests allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$action = $_POST['action'] ?? $input['action'] ?? '';
$walletAddress = trim($_POST['wallet_address'] ?? $input['wallet_address'] ?? '');

if ($walletAddress !== '') {
    $_SESSION['wallet'] = $walletAddress;
}

$controller = new GitHubController();

try {
    if ($action === 'check_username') {
        $username = trim($_POST['username'] ?? $input['username'] ?? '');

        if ($username === '') {
            echo json_encode(['success' => false, 'error' => 'Please enter a GitHub username.']);
            exit;
        }

        if (!$controller->usernameExists($username)) {
            echo json_encode(['success' => false, 'error' => 'That GitHub username does not exist.']);
            exit;
        }

        $code = $controller->generateCode();
        $controller->setUsername($username);

        echo json_encode([
            'success' => true,
            'message' => 'Code generated. Add it to your GitHub bio.',
            'code' => $code,
            'username' => $username,
            'expires_at' => $_SESSION['github_verification']['expires_at'] ?? null,
        ]);
        exit;
    }

    if ($action === 'verify_profile') {
        if (!$controller->isCodeValid()) {
            unset($_SESSION['github_verification']);
            echo json_encode(['success' => false, 'error' => 'Your verification code has expired. Please start over.']);
            exit;
        }

        $username = $_SESSION['github_verification']['username'] ?? '';
        $code = $_SESSION['github_verification']['code'] ?? '';

        if ($username === '' || $code === '') {
            unset($_SESSION['github_verification']);
            echo json_encode(['success' => false, 'error' => 'Session data missing. Please start over.']);
            exit;
        }

        if (!$controller->checkProfileForCode($username, $code)) {
            echo json_encode([
                'success' => false,
                'error' => 'Could not find the code in your bio. Make sure your profile is public and the code is exact.',
            ]);
            exit;
        }

        $controller->completeVerification($username);

        echo json_encode([
            'success' => true,
            'message' => 'Your GitHub account has been linked.',
            'username' => $username,
        ]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Unknown action.']);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $error->getMessage()]);
}
?>
