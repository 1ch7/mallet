<?php
// link_github.php - Main file
require_once 'controllers/GitHubController.php';

$controller = new GitHubController();
$message = '';
$step = 1;

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'check_username') {
        $username = trim($_POST['username'] ?? '');
        if ($username === '') {
            $message = 'Please enter a GitHub username.';
        } elseif (!$controller->usernameExists($username)) {
            $message = 'That GitHub username does not exist.';
        } else {
            // Generate code and store in session
            $code = $controller->generateCode();
            $controller->setUsername($username);
            $step = 2;
            $message = '✅ Code generated! Add it to your GitHub bio.';
        }
    } elseif (isset($_POST['action']) && $_POST['action'] === 'verify_profile') {
        if (!$controller->isCodeValid()) {
            $message = 'Your verification code has expired. Please start over.';
            unset($_SESSION['github_verification']);
            $step = 1;
        } else {
            $username = $_SESSION['github_verification']['username'] ?? '';
            $code = $_SESSION['github_verification']['code'] ?? '';
            if ($username && $code) {
                if ($controller->checkProfileForCode($username, $code)) {
                    $controller->completeVerification($username);
                    $step = 3;
                    $message = 'Success! Your GitHub account has been linked.';
                } else {
                    $message = 'Could not find the code in your bio. Make sure it is exactly "' . $code . '" and your profile is public.';
                    $step = 2;
                }
            } else {
                $message = 'Session data missing. Please start over.';
                unset($_SESSION['github_verification']);
                $step = 1;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Link GitHub Account</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2em; }
        .code { font-weight: bold; font-size: 1.5em; letter-spacing: 2px; background: #f0f0f0; padding: 0.5em; display: inline-block; }
        .message { color: #d00; margin: 1em 0; }
        .success { color: #0a0; }
    </style>
</head>
<body>
<h1>Link Your GitHub Account</h1>

<?php if ($message): ?>
    <p class="message <?php echo ($step === 3) ? 'success' : ''; ?>">
        <?php echo htmlspecialchars($message); ?>
    </p>
<?php endif; ?>

<?php if ($step === 1): ?>
    <form method="post">
        <input type="hidden" name="action" value="check_username">
        <label for="username">GitHub Username:</label><br>
        <input type="text" id="username" name="username" placeholder="e.g., octocat" required autocomplete="off">
        <button type="submit">Generate Code</button>
        <a href="../index.html">
            <button type="button">Back</button>
        </a>
    </form>
    <p><small>Your GitHub profile must be <strong>public</strong> for verification to work.</small></p>

<?php elseif ($step === 2): ?>
    <?php 
    // Get the code from session
    $code = $_SESSION['github_verification']['code'] ?? 'ERROR: No code found';
    $username = $_SESSION['github_verification']['username'] ?? 'Unknown';
    ?>
    <p>Go to your GitHub profile and edit your <strong>Bio</strong> to contain this exact code:</p>
    <div class="code"><?php echo htmlspecialchars($code); ?></div>
    <p><small>This code will expire in 30 minutes. Your profile must be <strong>public</strong>.</small></p>
    
    <p><strong>Steps:</strong></p>
    <ol>
        <li>Go to <a href="https://github.com/settings/profile" target="_blank">GitHub Profile Settings</a></li>
        <li>Paste this code into your <strong>Bio</strong> field: <code><?php echo htmlspecialchars($code); ?></code></li>
        <li>Click "Save" or "Update profile"</li>
        <li>Click the button below to verify</li>
    </ol>

    <form method="post" style="margin-top:1em;">
        <input type="hidden" name="action" value="verify_profile">
        <button type="submit">Check Profile</button>
    </form>

<?php elseif ($step === 3): ?>
    <p>Your GitHub account <strong><?php echo htmlspecialchars($_SESSION['github_verification']['username'] ?? 'Unknown'); ?></strong> is now linked!</p>
    <p><a href="index.php">Back</a></p>
<?php endif; ?>

</body>
</html>
