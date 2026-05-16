<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MetaMask Wallet Checker</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
            transition: transform 0.3s ease;
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }

        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }

        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px 30px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        button:active {
            transform: translateY(0);
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .info-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-top: 25px;
            border-left: 4px solid #667eea;
        }

        .info-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 8px;
        }

        .info-value {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #333;
            word-break: break-all;
            background: white;
            padding: 10px;
            border-radius: 8px;
            margin-top: 5px;
        }

        .status {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            border-radius: 10px;
            margin-top: 20px;
        }

        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .status.warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }

        .status-icon {
            font-size: 20px;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .network-info {
            margin-top: 15px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }

        hr {
            margin: 20px 0;
            border: none;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦊 MetaMask Wallet Checker</h1>
        <p class="subtitle">Connect and verify your Ethereum wallet</p>

        <button id="connectBtn">
            Connect MetaMask
        </button>

        <div id="status"></div>

        <div id="walletInfo" style="display: none;">
            <div class="info-card">
                <div class="info-label">📫 Wallet Address</div>
                <div class="info-value" id="address"></div>
            </div>

            <div class="info-card">
                <div class="info-label">✍️ Signature</div>
                <div class="info-value" id="signature" style="font-size: 12px;"></div>
            </div>

            <div class="info-card">
                <div class="info-label">📝 Signed Message</div>
                <div class="info-value" id="message"></div>
            </div>
        </div>

        <div class="network-info">
            <span id="networkName"></span>
        </div>
    </div>

    <script type="importmap">
        {
            "imports": {
                "ethers": "https://esm.sh/ethers@6.12.0"
            }
        }
    </script>

    <script type="module">
        import { ethers } from "ethers";

        const connectBtn = document.getElementById('connectBtn');
        const statusDiv = document.getElementById('status');
        const walletInfoDiv = document.getElementById('walletInfo');
        const addressSpan = document.getElementById('address');
        const signatureSpan = document.getElementById('signature');
        const messageSpan = document.getElementById('message');
        const networkNameSpan = document.getElementById('networkName');

        async function connectWallet() {
            // Reset UI
            walletInfoDiv.style.display = 'none';
            statusDiv.innerHTML = '';
            connectBtn.disabled = true;
            connectBtn.innerHTML = '<span class="loading"></span> Connecting...';

            try {
                // Check if MetaMask is installed
                if (!window.ethereum) {
                    showStatus('error', '⚠️', 'MetaMask not detected! Please install MetaMask extension.');
                    connectBtn.disabled = false;
                    connectBtn.innerHTML = 'Connect MetaMask';
                    return;
                }

                showStatus('warning', '🔄', 'Requesting wallet connection...');

                // Create provider and request accounts
                const provider = new ethers.BrowserProvider(window.ethereum);
                
                // Request account access
                const accounts = await provider.send("eth_requestAccounts", []);
                
                showStatus('success', '✅', 'Wallet connected successfully!');

                // Get signer and address
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                
                // Display address
                addressSpan.textContent = address;
                
                // Get network info
                const network = await provider.getNetwork();
                const chainId = network.chainId;
                let networkName = 'Unknown Network';
                
                // Common network names
                const networks = {
                    1n: 'Ethereum Mainnet',
                    11155111n: 'Sepolia Testnet',
                    5n: 'Goerli Testnet',
                    137n: 'Polygon Mainnet',
                    80002n: 'Amoy Testnet',
                    56n: 'BNB Smart Chain',
                    97n: 'BSC Testnet'
                };
                
                networkName = networks[chainId] || `Chain ID: ${chainId}`;
                networkNameSpan.innerHTML = `🌐 Network: ${networkName}`;

                // Sign a message to verify ownership
                const message = "Verify wallet ownership";
                messageSpan.textContent = message;
                
                showStatus('warning', '✍️', 'Please sign the message to verify wallet ownership...');
                
                const signature = await signer.signMessage(message);
                signatureSpan.textContent = signature;
                
                showStatus('success', '✅', 'Wallet verification complete!');

                setTimeout(() => {
                    window.location.href = `linkAccount.php?address=${address}&signature=${encodeURIComponent(signature)}`;
                }, 1000);
                
                // Show wallet info
                walletInfoDiv.style.display = 'block';
                
                // Log to console as well
                console.log('Wallet Address:', address);
                console.log('Signature:', signature);
                console.log('Network:', networkName);
                console.log('Chain ID:', chainId.toString());
                
            } catch (error) {
                console.error('Error:', error);
                
                // Handle user rejection
                if (error.code === 'ACTION_REJECTED' || error.message.includes('rejected')) {
                    showStatus('error', '❌', 'You rejected the request. Please try again.');
                } else {
                    showStatus('error', '❌', `Error: ${error.message}`);
                }
                
                walletInfoDiv.style.display = 'none';
            } finally {
                connectBtn.disabled = false;
                connectBtn.innerHTML = 'Connect MetaMask';
            }
        }

        function showStatus(type, icon, message) {
            statusDiv.innerHTML = `
                <div class="status ${type}">
                    <span class="status-icon">${icon}</span>
                    <span>${message}</span>
                </div>
            `;
        }

        // Check if MetaMask is already connected on page load
        async function checkExistingConnection() {
            if (window.ethereum && window.ethereum.selectedAddress) {
                showStatus('success', '🟢', 'MetaMask detected and ready!');
                networkNameSpan.innerHTML = '🌐 Click Connect to verify wallet';
            } else if (window.ethereum) {
                showStatus('warning', '🦊', 'MetaMask detected. Click Connect to get started.');
                networkNameSpan.innerHTML = '🌐 Ready to connect';
            } else {
                showStatus('error', '⚠️', 'MetaMask not detected. Please install the extension.');
            }
        }

        // Add event listener for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    showStatus('warning', '🔒', 'Wallet disconnected. Click Connect to reconnect.');
                    walletInfoDiv.style.display = 'none';
                } else {
                    showStatus('success', '🔄', 'Account changed. Reconnect to verify.');
                    walletInfoDiv.style.display = 'none';
                }
            });
            
            window.ethereum.on('chainChanged', () => {
                showStatus('warning', '🔄', 'Network changed. Please reconnect.');
                walletInfoDiv.style.display = 'none';
            });
        }

        // Attach event listener
        connectBtn.addEventListener('click', connectWallet);
        
        // Check on page load
        checkExistingConnection();
    </script>
</body>
</html>