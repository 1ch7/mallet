<?php
// test_analysis.php
require_once 'controllers/checkController.php';

$controller = new checkController('3DnUE3NupdMwpA8b4crqbgqjj37'); // Your working key
$result = $controller->analyzeWallet('0x4951b1018033954f02e96ec9b7375336b5f7b6da');

echo "<pre>";
print_r($result);
echo "</pre>";
?>